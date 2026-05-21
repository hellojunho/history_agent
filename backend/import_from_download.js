const fs = require('fs');
const path = require('path');
const http = require('http');

const DOWNLOAD_DIR = path.join(__dirname, '../download');
const UPLOAD_DIR = path.join(__dirname, 'public/uploads');

// public/uploads 폴더가 없으면 생성
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 로컬 이미지 복사 및 웹 경로 치환 헬퍼 함수
function handleLocalImage(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') return imagePath;

  let fullPath = '';
  if (imagePath.startsWith('download/')) {
    fullPath = path.join(__dirname, '../', imagePath);
  } else if (path.isAbsolute(imagePath) && fs.existsSync(imagePath)) {
    fullPath = imagePath;
  } else {
    const possiblePath = path.join(__dirname, '../', imagePath);
    if (fs.existsSync(possiblePath)) {
      fullPath = possiblePath;
    }
  }

  if (fullPath && fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const filename = path.basename(fullPath);
    const destPath = path.join(UPLOAD_DIR, filename);
    
    // 파일 복사
    fs.copyFileSync(fullPath, destPath);
    console.log(`📸 Copied image: ${imagePath} -> backend/public/uploads/${filename}`);
    return `/uploads/${filename}`;
  }

  return imagePath;
}

async function importExamToDB(examData) {
  // Map our PDF parser JSON format to the DB Seed API expected format
  const mappedPayload = {
    year: 2026, // Fallback if year not extracted (we don't extract it yet)
    roundNumber: examData.round,
    level: examData.examType,
    title: examData.title,
    examDate: new Date().toISOString().split('T')[0], // Fallback temp date
    totalQuestions: examData.questions.length,
    sourceUrl: "https://www.historyexam.go.kr",
    pdfFilePath: null,
    questions: examData.questions.map(q => {
      let imageUrl = q.imageUrls && q.imageUrls.length > 0 ? q.imageUrls[0] : null;
      imageUrl = handleLocalImage(imageUrl);

      const choices = (q.options || []).map(opt => {
        if (typeof opt === 'string' && (opt.includes('/image/') || opt.startsWith('download/'))) {
          return handleLocalImage(opt);
        }
        return opt;
      });

      return {
        questionNumber: q.questionNumber,
        contentText: q.questionText,
        imageUrl: imageUrl,
        choices: choices,
        answer: q.correctOption,
        explanation: q.explanation,
        wrongExplanations: {},
        era: null,
        topic: null,
        difficulty: null,
        frequentConcept: false,
        sourceUrl: null
      };
    })
  };

  const postData = JSON.stringify(mappedPayload);
  const options = {
    hostname: 'localhost',
    port: 20000,
    path: '/api/admin/seed-cbt',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else if (res.statusCode === 409) {
          resolve({ status: 409, message: 'Already registered' });
        } else {
          reject(new Error(`API Error ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function processDownloads() {
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    console.log('Download directory not found.');
    return;
  }

  const files = fs.readdirSync(DOWNLOAD_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  if (jsonFiles.length === 0) {
    console.log('No exam data files found in download/.');
    return;
  }

  for (const file of jsonFiles) {
    const filePath = path.join(DOWNLOAD_DIR, file);
    try {
      console.log(`Processing ${file}...`);
      const examData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      importExamToDB(examData).then(result => {
        if (result.status === 409) {
          console.log(`\n⏭️  Skipping: ${examData.title} is already registered in DB (409 Conflict)`);
        } else {
          console.log(`✅ Success: ${file} => Exam Registered (Message: ${result.message})`);
        }
      }).catch(e => {
        console.error(`❌ Failed to process ${file}:`, e.message);
      });
      
    } catch (e) {
      console.error(`❌ Failed to process ${file}:`, e.message);
    }
  }
}

processDownloads();

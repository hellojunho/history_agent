const { Client } = require('pg');

async function deleteExam() {
  const round = process.argv[2];
  if (!round) {
    console.error('❌ Error: Round number is required. Usage: node delete_exam.js <round>');
    process.exit(1);
  }

  const client = new Client({
    user: process.env.DATABASE_USER || 'user',
    host: process.env.DATABASE_HOST || 'localhost',
    database: process.env.DATABASE_NAME || 'hanneunggeom',
    password: process.env.DATABASE_PASSWORD || 'password',
    port: parseInt(process.env.DATABASE_PORT || '55500'), 
  });

  try {
    await client.connect();
    console.log(`🔍 제${round}회 시험 데이터를 찾는 중... (DB: ${client.host}:${client.port})`);

    const res = await client.query('SELECT id, title FROM "exams" WHERE round_number = $1', [parseInt(round)]);
    
    if (res.rows.length > 0) {
      console.log(`🗑️  제${round}회 시험 ${res.rows.length}개를 삭제합니다.`);
      for (const row of res.rows) {
        console.log(`   - 삭제 대상: ${row.title} (ID: ${row.id})`);
        
        // 1. user_answers 삭제 (questions 참조)
        await client.query('DELETE FROM "user_answers" WHERE "question_id" IN (SELECT id FROM "questions" WHERE "exam_id" = $1)', [row.id]);
        // 2. user_exam_results 삭제 (exams 참조)
        await client.query('DELETE FROM "user_exam_results" WHERE "exam_id" = $1', [row.id]);
        // 3. questions 삭제 (exams 참조)
        await client.query('DELETE FROM "questions" WHERE "exam_id" = $1', [row.id]);
        // 4. exams 삭제
        await client.query('DELETE FROM "exams" WHERE id = $1', [row.id]);
      }
      
      console.log(`✅ 제${round}회 시험 데이터 삭제 완료`);
    } else {
      console.log(`ℹ️  제${round}회 시험 데이터를 찾을 수 없습니다.`);
    }
  } catch (err) {
    console.error('❌ Error deleting exam:', err.message);
  } finally {
    await client.end();
  }
}

deleteExam();

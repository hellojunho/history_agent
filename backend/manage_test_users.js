const { Client } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function run() {
  const action = process.argv[2];
  if (action !== 'create' && action !== 'delete') {
    console.error('❌ Error: Action must be either "create" or "delete". Usage: node manage_test_users.js <create|delete>');
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
    console.log(`🔌 DB에 연결되었습니다. (Host: ${client.host}:${client.port})`);

    const emails = [];
    for (let i = 1; i <= 10; i++) {
      emails.push(`testuser${i}@example.com`);
    }

    if (action === 'create') {
      console.log('🧹 기존 테스트 유저 데이터를 정리합니다...');
      await client.query('DELETE FROM "users" WHERE email = ANY($1)', [emails]);

      console.log('🔑 테스트 비밀번호를 해싱하고 있습니다...');
      const passwordHash = await bcrypt.hash('testpassword', 10);

      console.log('👤 10명의 테스트 유저를 생성하여 DB에 저장합니다...');
      const now = new Date();

      for (const email of emails) {
        const id = crypto.randomUUID();
        await client.query(
          `INSERT INTO "users" (id, email, password_hash, role, is_activate, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, email, passwordHash, 'general', true, now, now]
        );
        console.log(`   - 생성 완료: ${email}`);
      }
      console.log('✅ 10명의 테스트 유저가 성공적으로 생성되었습니다.');
    } else if (action === 'delete') {
      console.log('🗑️ 10명의 테스트 유저를 삭제(Hard Delete)합니다...');
      const res = await client.query('DELETE FROM "users" WHERE email = ANY($1)', [emails]);
      console.log(`✅ 삭제 완료! 총 ${res.rowCount}명의 테스트 유저가 물리적으로 제거되었습니다.`);
    }

  } catch (err) {
    console.error('❌ 작업 실행 중 오류가 발생했습니다:', err.message);
  } finally {
    await client.end();
  }
}

run();

const bcrypt = require('bcryptjs');

// كلمة المرور المشفرة التي أنشأتها
const storedHash = '$2b$10$D58TK/DY.Q8sANm/zCItSeM09wNX49h3vY6x3rRqlWIQblwrODnpC';

// كلمة المرور الأصلية
const password = '000000';

async function verify() {
  console.log('\n' + '='.repeat(60));
  console.log('التحقق من كلمة المرور');
  console.log('='.repeat(60));
  console.log('كلمة المرور: 000000');
  console.log('Hash المخزن:', storedHash);
  console.log('='.repeat(60));

  const isValid = await bcrypt.compare(password, storedHash);

  if (isValid) {
    console.log('✅ كلمة المرور صحيحة!');
    console.log('Hash الموجود في قاعدة البيانات صحيح ويطابق كلمة المرور 000000');
  } else {
    console.log('❌ كلمة المرور غير صحيحة!');
    console.log('يجب إعادة إنشاء Hash جديد');

    // إنشاء hash جديد
    const newHash = await bcrypt.hash(password, 10);
    console.log('\nHash الجديد:');
    console.log(newHash);
    console.log('\nقم بتحديث قاعدة البيانات باستخدام هذا الأمر SQL:');
    console.log(`UPDATE users SET password_hash = '${newHash}' WHERE email = 'admin@moh.gov.kw';`);
  }
  console.log('='.repeat(60) + '\n');
}

verify();

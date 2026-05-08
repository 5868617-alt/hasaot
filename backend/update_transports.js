require('dotenv').config();
const mongoose = require('mongoose');
require('./models/Transport');
const Senior = require('./models/Senior');
const Transport = require('./models/Transport');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const t1 = await Transport.findOneAndUpdate(
    { name: 'שמואל הנביא מא"ש גאולה - בוקר' },
    { name: 'שמואל הנביא מא"ש גאולה - בוקר', shift: 'בוקר', time: '8:35', escortName: 'ריקי', escortPhone: '052-3429086', activeDays: ['א'] },
    { upsert: true, new: true }
  );
  console.log('הסעה 1:', t1.name);

  const t2 = await Transport.findOneAndUpdate(
    { name: 'גוש 80 סנהדריה בוכרים - בוקר' },
    { name: 'גוש 80 סנהדריה בוכרים - בוקר', shift: 'בוקר', time: '8:35', escortName: 'ריקי', escortPhone: '052-3429086', activeDays: ['א'] },
    { upsert: true, new: true }
  );
  console.log('הסעה 2:', t2.name);

  const toShmuel = ['רינת רן ','אברמוב בתיה','קלירס רבקה ','אסרף דינה','הבלין שמואל ','בורשטיין ציפורה ','אברהם שולמית','טרכטינגוט אריה'];
  for (const name of toShmuel) {
    const r = await Senior.updateOne({ name }, { morningTransport: t1._id });
    console.log(name, r.modifiedCount ? '✓' : 'לא נמצא');
  }

  const toGush = ['חיים מתתיהו','גנץ רחל','קליין גבריאל','גז לאה','אוהל אליהו','בביאן דליה','גרוס','ברוק'];
  for (const name of toGush) {
    const r = await Senior.updateOne({ name }, { morningTransport: t2._id });
    console.log(name, r.modifiedCount ? '✓' : 'לא נמצא');
  }

  const tz = await Transport.findOne({ name: 'גוש 80 סנהדריה בוכרים - צהריים' });
  const tm = await Transport.findOne({ name: 'מקור ברוך גאולה שמואל הנביא - צהריים' });

  await Senior.updateOne({ name: /כהן רבקה/ }, { morningTransport: t1._id, afternoonTransport: tm._id, arrivalDays: ['א'] });
  console.log('כהן רבקה ✓');
  await Senior.updateOne({ name: /קרויזר/ }, { morningTransport: t2._id, afternoonTransport: tz._id, arrivalDays: ['א'] });
  console.log('קרויזר חיה ✓');

  await mongoose.disconnect();
  console.log('סיום!');
});

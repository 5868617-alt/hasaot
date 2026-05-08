import re

with open('seed.js', 'r', encoding='utf-8') as f:
    content = f.read()

# שמות שעוברים להסעה החדשה שמואל הנביא
to_shmuel = ['אברמוב בתיה', 'רבקה קלירס', 'אסרף גינה', 'שמואל הבלין', 'ציפורה בורנשטיין', 'אברהם שולמית', 'טרכטינגוט אריה']

old = "t('גוש 80 ש.הנביא בוכרים גאולה - בוקר'), afternoonTransport: t('מקור ברוך גאולה שמואל הנביא - צהריים')"
new = "t('שמואל הנביא מא\"ש גאולה - בוקר'), afternoonTransport: t('מקור ברוך גאולה שמואל הנביא - צהריים')"

lines = content.split('\n')
for i, line in enumerate(lines):
    if any(name in line for name in to_shmuel):
        if old in line:
            lines[i] = line.replace(old, new)

with open('seed.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print('done!')

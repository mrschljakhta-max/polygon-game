(function(){
'use strict';
const app=document.getElementById('ds-app');
const shell=document.querySelector('.ds-shell')||document.documentElement;
const keyboard=window.VidlikKeyboard;
const STORE='vidlik-hotkeys-desktop-sectors-v1';
const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const T=(title,instruction,code,labels,scene,opt={})=>({title,instruction,code,labels,scene,ctrl:!!opt.ctrl,shift:!!opt.shift,alt:!!opt.alt});
const L=(name,desc,tasks)=>({name,desc,tasks});

const SECTORS={
2:{name:'Робота з документами',short:'Документи',mobile:'Ctrl+H та системні/browser-комбінації винесені в мобільний симулятор.',levels:[
 L('Форматування тексту','Ctrl+B · Ctrl+I · Ctrl+U',[
  T('Зробіть заголовок напівжирним','Застосуйте напівжирний стиль до виділеного заголовка.','KeyB',['Ctrl','B'],'doc-bold',{ctrl:true}),
  T('Застосуйте курсив','Застосуйте курсив до виділеного заголовка.','KeyI',['Ctrl','I'],'doc-italic',{ctrl:true}),
  T('Підкресліть заголовок','Підкресліть виділений заголовок.','KeyU',['Ctrl','U'],'doc-underline',{ctrl:true})]),
 L('Збереження і друк','Ctrl+S · Ctrl+P',[
  T('Збережіть документ','Збережіть поточні зміни.','KeyS',['Ctrl','S'],'doc-save',{ctrl:true}),
  T('Відкрийте друк','Відкрийте попередній перегляд друку.','KeyP',['Ctrl','P'],'doc-print',{ctrl:true})]),
 L('Пошук і посилання','Ctrl+F · Ctrl+K',[
  T('Знайдіть слово','Відкрийте пошук у документі.','KeyF',['Ctrl','F'],'doc-find',{ctrl:true}),
  T('Додайте посилання','Додайте гіперпосилання до виділеного тексту.','KeyK',['Ctrl','K'],'doc-link',{ctrl:true})]),
 L('Вирівнювання','Ctrl+L · Ctrl+E · Ctrl+R · Ctrl+J',[
  T('Вирівняйте ліворуч','Вирівняйте абзац по лівому краю.','KeyL',['Ctrl','L'],'doc-left',{ctrl:true}),
  T('Вирівняйте по центру','Вирівняйте абзац по центру.','KeyE',['Ctrl','E'],'doc-center',{ctrl:true}),
  T('Вирівняйте праворуч','Вирівняйте абзац по правому краю.','KeyR',['Ctrl','R'],'doc-right',{ctrl:true}),
  T('Вирівняйте по ширині','Вирівняйте абзац по ширині.','KeyJ',['Ctrl','J'],'doc-justify',{ctrl:true})]),
 L('Початок і кінець','Ctrl+Home · Ctrl+End',[
  T('Перейдіть на початок','Перейдіть на початок документа.','Home',['Ctrl','Home'],'doc-home',{ctrl:true}),
  T('Перейдіть у кінець','Перейдіть у кінець документа.','End',['Ctrl','End'],'doc-end',{ctrl:true})]),
 L('Навігація по словах','Ctrl+← · Ctrl+→',[
  T('На слово ліворуч','Перемістіть курсор на одне слово ліворуч.','ArrowLeft',['Ctrl','←'],'doc-word-left',{ctrl:true}),
  T('На слово праворуч','Перемістіть курсор на одне слово праворуч.','ArrowRight',['Ctrl','→'],'doc-word-right',{ctrl:true})]),
 L('Видалення словами','Ctrl+Backspace · Ctrl+Delete',[
  T('Видаліть попереднє слово','Видаліть слово перед курсором.','Backspace',['Ctrl','Backspace'],'doc-del-prev',{ctrl:true}),
  T('Видаліть наступне слово','Видаліть слово після курсора.','Delete',['Ctrl','Delete'],'doc-del-next',{ctrl:true})]),
 L('Розриви','Ctrl+Enter · Shift+Enter',[
  T('Створіть нову сторінку','Вставте розрив сторінки.','Enter',['Ctrl','Enter'],'doc-pagebreak',{ctrl:true}),
  T('Перенесіть рядок','Вставте м’який перенос рядка.','Enter',['Shift','Enter'],'doc-linebreak',{shift:true})]),
 L('Фрагменти тексту','Ctrl+A · Ctrl+C · Ctrl+X · Ctrl+V · Ctrl+Z',[
  T('Виділіть увесь текст','Виділіть весь вміст документа.','KeyA',['Ctrl','A'],'doc-select',{ctrl:true}),
  T('Скопіюйте фрагмент','Скопіюйте виділений фрагмент.','KeyC',['Ctrl','C'],'doc-copy',{ctrl:true}),
  T('Виріжте фрагмент','Виріжте виділений фрагмент.','KeyX',['Ctrl','X'],'doc-cut',{ctrl:true}),
  T('Вставте фрагмент','Вставте скопійований фрагмент.','KeyV',['Ctrl','V'],'doc-paste',{ctrl:true}),
  T('Скасуйте дію','Скасуйте останню зміну.','KeyZ',['Ctrl','Z'],'doc-undo',{ctrl:true})]),
 L('Контрольна місія','Змішаний сценарій без підказок',[
  T('Виділіть увесь документ','Виділіть весь текст.','KeyA',['Ctrl','A'],'doc-select',{ctrl:true}),
  T('Зробіть заголовок напівжирним','Застосуйте напівжирний стиль.','KeyB',['Ctrl','B'],'doc-bold',{ctrl:true}),
  T('Вирівняйте по центру','Вирівняйте абзац по центру.','KeyE',['Ctrl','E'],'doc-center',{ctrl:true}),
  T('Збережіть зміни','Збережіть документ.','KeyS',['Ctrl','S'],'doc-save',{ctrl:true}),
  T('Відкрийте друк','Підготуйте документ до друку.','KeyP',['Ctrl','P'],'doc-print',{ctrl:true})])
]},
3:{name:'Електронні таблиці',short:'Таблиці',levels:[
 L('Редагування клітинки','F2',[
  T('Редагуйте активну клітинку','Перейдіть у режим редагування активної клітинки.','F2',['F2'],'sheet-edit')]),
 L('Швидка навігація','Ctrl+стрілки',[
  T('До краю праворуч','Перейдіть до краю заповненого діапазону праворуч.','ArrowRight',['Ctrl','→'],'sheet-nav-right',{ctrl:true}),
  T('До краю вниз','Перейдіть до нижнього краю діапазону.','ArrowDown',['Ctrl','↓'],'sheet-nav-down',{ctrl:true}),
  T('До краю ліворуч','Перейдіть до лівого краю діапазону.','ArrowLeft',['Ctrl','←'],'sheet-nav-left',{ctrl:true}),
  T('До краю вгору','Перейдіть до верхнього краю діапазону.','ArrowUp',['Ctrl','↑'],'sheet-nav-up',{ctrl:true})]),
 L('Виділення діапазону','Ctrl+Shift+стрілки',[
  T('Розширте виділення праворуч','Виділіть діапазон до правого краю даних.','ArrowRight',['Ctrl','Shift','→'],'sheet-range-right',{ctrl:true,shift:true}),
  T('Розширте виділення вниз','Виділіть діапазон донизу.','ArrowDown',['Ctrl','Shift','↓'],'sheet-range-down',{ctrl:true,shift:true})]),
 L('Рядки та стовпці','Ctrl+Space · Shift+Space',[
  T('Виділіть стовпець','Виділіть увесь поточний стовпець.','Space',['Ctrl','Space'],'sheet-col',{ctrl:true}),
  T('Виділіть рядок','Виділіть увесь поточний рядок.','Space',['Shift','Space'],'sheet-row',{shift:true})]),
 L('Заповнення','Ctrl+D · Ctrl+R',[
  T('Заповніть вниз','Скопіюйте верхнє значення вниз у виділений діапазон.','KeyD',['Ctrl','D'],'sheet-fill-down',{ctrl:true}),
  T('Заповніть праворуч','Скопіюйте ліве значення праворуч.','KeyR',['Ctrl','R'],'sheet-fill-right',{ctrl:true})]),
 L('Автосума','Alt+=',[
  T('Порахуйте суму','Вставте формулу автосуми.','Equal',['Alt','='],'sheet-sum',{alt:true})]),
 L('Дата і час','Ctrl+; · Ctrl+Shift+;',[
  T('Вставте дату','Вставте поточну дату.','Semicolon',['Ctrl',';'],'sheet-date',{ctrl:true}),
  T('Вставте час','Вставте поточний час.','Semicolon',['Ctrl','Shift',';'],'sheet-time',{ctrl:true,shift:true})]),
 L('Фільтри','Ctrl+Shift+L',[
  T('Увімкніть фільтр','Додайте фільтри до заголовків таблиці.','KeyL',['Ctrl','Shift','L'],'sheet-filter',{ctrl:true,shift:true})]),
 L('Показ формул','Ctrl+`',[
  T('Покажіть формули','Перемкніть відображення формул у клітинках.','Backquote',['Ctrl','`'],'sheet-formulas',{ctrl:true})]),
 L('Контрольна місія','Навігація, формули та таблиця',[
  T('Редагуйте клітинку','Відкрийте редагування активної клітинки.','F2',['F2'],'sheet-edit'),
  T('Виділіть стовпець','Виділіть увесь стовпець.','Space',['Ctrl','Space'],'sheet-col',{ctrl:true}),
  T('Порахуйте суму','Вставте автосуму.','Equal',['Alt','='],'sheet-sum',{alt:true}),
  T('Увімкніть фільтри','Додайте фільтри до таблиці.','KeyL',['Ctrl','Shift','L'],'sheet-filter',{ctrl:true,shift:true}),
  T('Покажіть формули','Перемкніть режим формул.','Backquote',['Ctrl','`'],'sheet-formulas',{ctrl:true})])
]},
4:{name:'Презентації та візуальний контент',short:'Презентації',mobile:'F5 / Shift+F5 залишаються для мобільного симулятора.',levels:[
 L('Новий слайд','Ctrl+M',[T('Створіть новий слайд','Додайте новий слайд до презентації.','KeyM',['Ctrl','M'],'slide-new',{ctrl:true})]),
 L('Дублювання','Ctrl+D',[T('Дублюйте слайд','Створіть копію поточного слайда.','KeyD',['Ctrl','D'],'slide-duplicate',{ctrl:true})]),
 L('Об’єкти','Ctrl+C · Ctrl+V · Ctrl+X',[
  T('Скопіюйте об’єкт','Скопіюйте виділений об’єкт.','KeyC',['Ctrl','C'],'slide-copy',{ctrl:true}),
  T('Вставте об’єкт','Вставте копію об’єкта.','KeyV',['Ctrl','V'],'slide-paste',{ctrl:true}),
  T('Виріжте об’єкт','Виріжте виділений об’єкт.','KeyX',['Ctrl','X'],'slide-cut',{ctrl:true})]),
 L('Історія змін','Ctrl+Z · Ctrl+Y',[
  T('Скасуйте зміну','Скасуйте останню дію.','KeyZ',['Ctrl','Z'],'slide-undo',{ctrl:true}),
  T('Повторіть зміну','Поверніть скасовану дію.','KeyY',['Ctrl','Y'],'slide-redo',{ctrl:true})]),
 L('Групування','Ctrl+G · Ctrl+Shift+G',[
  T('Згрупуйте об’єкти','Об’єднайте виділені об’єкти в групу.','KeyG',['Ctrl','G'],'slide-group',{ctrl:true}),
  T('Розгрупуйте об’єкти','Розділіть групу на окремі об’єкти.','KeyG',['Ctrl','Shift','G'],'slide-ungroup',{ctrl:true,shift:true})]),
 L('Посилання','Ctrl+K',[T('Додайте посилання','Додайте гіперпосилання до об’єкта.','KeyK',['Ctrl','K'],'slide-link',{ctrl:true})]),
 L('Формат за зразком','Ctrl+Shift+C · Ctrl+Shift+V',[
  T('Скопіюйте формат','Скопіюйте оформлення виділеного об’єкта.','KeyC',['Ctrl','Shift','C'],'slide-copy-format',{ctrl:true,shift:true}),
  T('Застосуйте формат','Застосуйте скопійоване оформлення.','KeyV',['Ctrl','Shift','V'],'slide-apply-format',{ctrl:true,shift:true})]),
 L('Переміщення','Стрілки',[
  T('Перемістіть праворуч','Посуньте виділений об’єкт праворуч.','ArrowRight',['→'],'slide-move-right'),
  T('Перемістіть вниз','Посуньте виділений об’єкт вниз.','ArrowDown',['↓'],'slide-move-down')]),
 L('Точна зміна розміру','Shift+стрілки',[
  T('Збільшіть по ширині','Збільшіть об’єкт по горизонталі.','ArrowRight',['Shift','→'],'slide-resize-right',{shift:true}),
  T('Збільшіть по висоті','Збільшіть об’єкт по вертикалі.','ArrowDown',['Shift','↓'],'slide-resize-down',{shift:true})]),
 L('Контрольна місія','Змішане редагування слайда',[
  T('Створіть новий слайд','Додайте новий слайд.','KeyM',['Ctrl','M'],'slide-new',{ctrl:true}),
  T('Дублюйте його','Створіть копію слайда.','KeyD',['Ctrl','D'],'slide-duplicate',{ctrl:true}),
  T('Згрупуйте об’єкти','Згрупуйте елементи на слайді.','KeyG',['Ctrl','G'],'slide-group',{ctrl:true}),
  T('Скопіюйте формат','Скопіюйте оформлення.','KeyC',['Ctrl','Shift','C'],'slide-copy-format',{ctrl:true,shift:true}),
  T('Застосуйте формат','Застосуйте оформлення до другого об’єкта.','KeyV',['Ctrl','Shift','V'],'slide-apply-format',{ctrl:true,shift:true})])
]},
5:{name:'Цифрова комунікація та спільна робота',short:'Комунікація',mobile:'Esc та системні/browser-комбінації — у мобільному симуляторі.',levels:[
 L('Надсилання','Enter',[T('Надішліть повідомлення','Надішліть підготовлене повідомлення.','Enter',['Enter'],'chat-send')]),
 L('Новий рядок','Shift+Enter',[T('Перенесіть рядок','Створіть новий рядок без надсилання.','Enter',['Shift','Enter'],'chat-newline',{shift:true})]),
 L('Підтверджене надсилання','Ctrl+Enter',[T('Надішліть повідомлення','Підтвердьте надсилання комбінацією клавіш.','Enter',['Ctrl','Enter'],'chat-ctrl-send',{ctrl:true})]),
 L('Посилання','Ctrl+K',[T('Вставте посилання','Додайте гіперпосилання до повідомлення.','KeyK',['Ctrl','K'],'chat-link',{ctrl:true})]),
 L('Пошук','Ctrl+F',[T('Знайдіть повідомлення','Відкрийте пошук у поточній розмові.','KeyF',['Ctrl','F'],'chat-find',{ctrl:true})]),
 L('Виділення і копія','Ctrl+A · Ctrl+C',[
  T('Виділіть текст','Виділіть весь текст у полі повідомлення.','KeyA',['Ctrl','A'],'chat-select',{ctrl:true}),
  T('Скопіюйте текст','Скопіюйте виділений текст.','KeyC',['Ctrl','C'],'chat-copy',{ctrl:true})]),
 L('Вставлення і вирізання','Ctrl+V · Ctrl+X',[
  T('Вставте текст','Вставте скопійований фрагмент.','KeyV',['Ctrl','V'],'chat-paste',{ctrl:true}),
  T('Виріжте текст','Виріжте виділений фрагмент.','KeyX',['Ctrl','X'],'chat-cut',{ctrl:true})]),
 L('Скасування','Ctrl+Z · Ctrl+Y',[
  T('Скасуйте зміну','Скасуйте останню зміну тексту.','KeyZ',['Ctrl','Z'],'chat-undo',{ctrl:true}),
  T('Поверніть зміну','Повторіть скасовану зміну.','KeyY',['Ctrl','Y'],'chat-redo',{ctrl:true})]),
 L('Навігація полями','Tab · Shift+Tab',[
  T('Перейдіть вперед','Перейдіть до наступного елемента інтерфейсу.','Tab',['Tab'],'chat-tab'),
  T('Перейдіть назад','Поверніться до попереднього елемента.','Tab',['Shift','Tab'],'chat-shift-tab',{shift:true})]),
 L('Контрольна місія','Підготуйте й надішліть повідомлення',[
  T('Виділіть повідомлення','Виділіть весь текст.','KeyA',['Ctrl','A'],'chat-select',{ctrl:true}),
  T('Додайте посилання','Додайте гіперпосилання.','KeyK',['Ctrl','K'],'chat-link',{ctrl:true}),
  T('Перенесіть рядок','Створіть новий рядок без надсилання.','Enter',['Shift','Enter'],'chat-newline',{shift:true}),
  T('Надішліть повідомлення','Надішліть готовий текст.','Enter',['Enter'],'chat-send')])
]},
6:{name:'Інтернет, браузер та онлайн-сервіси',short:'Інтернет',mobile:'Ctrl+T, Ctrl+W, Ctrl+L, Ctrl+Shift+T, F11 та інші browser-shortcuts — тільки мобільний симулятор.',levels:[
 L('Пошук на сторінці','Ctrl+F',[T('Знайдіть слово','Відкрийте пошук на поточній сторінці.','KeyF',['Ctrl','F'],'web-find',{ctrl:true})]),
 L('Початок і кінець','Home · End',[
  T('На початок сторінки','Перейдіть на верх сторінки.','Home',['Home'],'web-home'),
  T('У кінець сторінки','Перейдіть у кінець сторінки.','End',['End'],'web-end')]),
 L('Сторінками','PageUp · PageDown',[
  T('Сторінка вгору','Прокрутіть сторінку на екран вгору.','PageUp',['PageUp'],'web-pageup'),
  T('Сторінка вниз','Прокрутіть сторінку на екран вниз.','PageDown',['PageDown'],'web-pagedown')]),
 L('Швидка прокрутка','Space · Shift+Space',[
  T('Прокрутіть вниз','Прокрутіть сторінку вниз на один екран.','Space',['Space'],'web-space'),
  T('Прокрутіть вгору','Прокрутіть сторінку вгору на один екран.','Space',['Shift','Space'],'web-shift-space',{shift:true})]),
 L('Масштаб','Ctrl++ · Ctrl+-',[
  T('Збільшіть масштаб','Збільшіть масштаб перегляду.','Equal',['Ctrl','+'],'web-zoom-plus',{ctrl:true,shift:true}),
  T('Зменште масштаб','Зменшіть масштаб перегляду.','Minus',['Ctrl','-'],'web-zoom-minus',{ctrl:true})]),
 L('Скидання масштабу','Ctrl+0',[T('Поверніть 100%','Скиньте масштаб сторінки до 100%.','Digit0',['Ctrl','0'],'web-zoom-reset',{ctrl:true})]),
 L('Навігація фокусом','Tab · Shift+Tab',[
  T('Наступний елемент','Перейдіть до наступного інтерактивного елемента.','Tab',['Tab'],'web-tab'),
  T('Попередній елемент','Поверніться до попереднього елемента.','Tab',['Shift','Tab'],'web-shift-tab',{shift:true})]),
 L('Активація','Enter',[T('Відкрийте вибране','Активуйте елемент, який перебуває у фокусі.','Enter',['Enter'],'web-enter')]),
 L('Навігація елементами','Стрілки',[
  T('Фокус праворуч','Перемістіть фокус на сусідній елемент.','ArrowRight',['→'],'web-arrow-right'),
  T('Фокус вниз','Перемістіть фокус на елемент нижче.','ArrowDown',['↓'],'web-arrow-down')]),
 L('Контрольна місія','Пошук, навігація і масштаб',[
  T('Знайдіть слово','Відкрийте пошук на сторінці.','KeyF',['Ctrl','F'],'web-find',{ctrl:true}),
  T('Прокрутіть униз','Перейдіть на екран нижче.','PageDown',['PageDown'],'web-pagedown'),
  T('Збільшіть масштаб','Збільшіть сторінку.','Equal',['Ctrl','+'],'web-zoom-plus',{ctrl:true,shift:true}),
  T('Поверніть 100%','Скиньте масштаб.','Digit0',['Ctrl','0'],'web-zoom-reset',{ctrl:true}),
  T('Активуйте елемент','Відкрийте вибраний елемент.','Enter',['Enter'],'web-enter')])
]},
7:{name:'Кібербезпека та безпечна поведінка онлайн',short:'Кібербезпека',mobile:'Win+L, Ctrl+Alt+Delete, Ctrl+Shift+Esc, Alt+F4 та інші системні комбінації — тільки мобільний симулятор.',levels:[
 L('Виділення підозрілих файлів','Ctrl+A',[T('Виділіть усі файли','Виділіть усі елементи у папці завантажень.','KeyA',['Ctrl','A'],'cyber-select',{ctrl:true})]),
 L('Копіювання хеша','Ctrl+C',[T('Скопіюйте контрольну суму','Скопіюйте виділений хеш для перевірки.','KeyC',['Ctrl','C'],'cyber-copy',{ctrl:true})]),
 L('Видалення','Delete',[T('Видаліть підозрілий файл','Перемістіть підозрілий файл до кошика.','Delete',['Delete'],'cyber-delete')]),
 L('Без кошика','Shift+Delete',[T('Видаліть без кошика','Безповоротно видаліть навчальний підозрілий файл.','Delete',['Shift','Delete'],'cyber-hard-delete',{shift:true})]),
 L('Відновлення помилки','Ctrl+Z',[T('Скасуйте видалення','Поверніть випадково видалений файл.','KeyZ',['Ctrl','Z'],'cyber-undo',{ctrl:true})]),
 L('Перейменування','F2',[T('Перейменуйте файл','Перейменуйте підозрілий файл для карантину.','F2',['F2'],'cyber-rename')]),
 L('Фіксація інциденту','Ctrl+S',[T('Збережіть нотатку','Збережіть запис про інцидент.','KeyS',['Ctrl','S'],'cyber-save',{ctrl:true})]),
 L('Пошук індикатора','Ctrl+F',[T('Знайдіть індикатор','Відкрийте пошук у журналі подій.','KeyF',['Ctrl','F'],'cyber-find',{ctrl:true})]),
 L('Безпечна навігація діалогом','Tab · Shift+Tab · Enter',[
  T('Наступна кнопка','Перейдіть до наступного елемента діалогу.','Tab',['Tab'],'cyber-tab'),
  T('Попередня кнопка','Поверніться до попереднього елемента.','Tab',['Shift','Tab'],'cyber-shift-tab',{shift:true}),
  T('Підтвердьте безпечну дію','Активуйте вибрану безпечну дію.','Enter',['Enter'],'cyber-enter')]),
 L('Контрольна місія','Безпечна робота з підозрілим файлом',[
  T('Виділіть файли','Виділіть усі елементи.','KeyA',['Ctrl','A'],'cyber-select',{ctrl:true}),
  T('Скопіюйте хеш','Скопіюйте контрольну суму.','KeyC',['Ctrl','C'],'cyber-copy',{ctrl:true}),
  T('Перейменуйте файл','Позначте файл як карантинний.','F2',['F2'],'cyber-rename'),
  T('Видаліть файл','Перемістіть його до кошика.','Delete',['Delete'],'cyber-delete'),
  T('Збережіть запис','Зафіксуйте інцидент.','KeyS',['Ctrl','S'],'cyber-save',{ctrl:true})])
]},
8:{name:'Практична цифрова робота та комплексні завдання',short:'Комплексні місії',levels:[
 L('Файлова місія','Ctrl+A · Ctrl+C · Ctrl+V',[
  T('Виділіть об’єкти','Виділіть усі робочі об’єкти.','KeyA',['Ctrl','A'],'cyber-select',{ctrl:true}),
  T('Скопіюйте дані','Скопіюйте виділений фрагмент.','KeyC',['Ctrl','C'],'cyber-copy',{ctrl:true}),
  T('Вставте копію','Вставте скопійовані дані.','KeyV',['Ctrl','V'],'doc-paste',{ctrl:true})]),
 L('Документ','Ctrl+B · Ctrl+I · Ctrl+U',[
  T('Зробіть заголовок напівжирним','Застосуйте напівжирне форматування.','KeyB',['Ctrl','B'],'doc-bold',{ctrl:true}),
  T('Додайте курсив','Застосуйте курсив.','KeyI',['Ctrl','I'],'doc-italic',{ctrl:true}),
  T('Підкресліть','Підкресліть заголовок.','KeyU',['Ctrl','U'],'doc-underline',{ctrl:true})]),
 L('Пошук і збереження','Ctrl+F · Ctrl+S',[
  T('Знайдіть інформацію','Відкрийте пошук у документі.','KeyF',['Ctrl','F'],'doc-find',{ctrl:true}),
  T('Збережіть результат','Збережіть поточні зміни.','KeyS',['Ctrl','S'],'doc-save',{ctrl:true})]),
 L('Таблиця','F2 · Ctrl+→ · Ctrl+Shift+↓',[
  T('Редагуйте клітинку','Відкрийте редагування клітинки.','F2',['F2'],'sheet-edit'),
  T('Перейдіть до краю','Перейдіть до правого краю даних.','ArrowRight',['Ctrl','→'],'sheet-nav-right',{ctrl:true}),
  T('Виділіть діапазон','Розширте виділення донизу.','ArrowDown',['Ctrl','Shift','↓'],'sheet-range-down',{ctrl:true,shift:true})]),
 L('Розрахунок','Alt+= · Ctrl+Shift+L',[
  T('Порахуйте суму','Вставте автосуму.','Equal',['Alt','='],'sheet-sum',{alt:true}),
  T('Увімкніть фільтри','Додайте фільтри.','KeyL',['Ctrl','Shift','L'],'sheet-filter',{ctrl:true,shift:true})]),
 L('Презентація','Ctrl+M · Ctrl+D · Ctrl+G',[
  T('Створіть слайд','Додайте новий слайд.','KeyM',['Ctrl','M'],'slide-new',{ctrl:true}),
  T('Дублюйте слайд','Створіть його копію.','KeyD',['Ctrl','D'],'slide-duplicate',{ctrl:true}),
  T('Згрупуйте об’єкти','Згрупуйте елементи.','KeyG',['Ctrl','G'],'slide-group',{ctrl:true})]),
 L('Комунікація','Shift+Enter · Enter',[
  T('Перенесіть рядок','Створіть новий рядок у повідомленні.','Enter',['Shift','Enter'],'chat-newline',{shift:true}),
  T('Надішліть повідомлення','Надішліть готовий текст.','Enter',['Enter'],'chat-send')]),
 L('Онлайн-навігація','Home · End · PageDown',[
  T('На початок','Перейдіть на верх сторінки.','Home',['Home'],'web-home'),
  T('У кінець','Перейдіть у кінець сторінки.','End',['End'],'web-end'),
  T('Сторінка вниз','Прокрутіть на екран нижче.','PageDown',['PageDown'],'web-pagedown')]),
 L('Безпечна дія','Delete · Ctrl+Z · Ctrl+S',[
  T('Видаліть підозрілий файл','Перемістіть файл до кошика.','Delete',['Delete'],'cyber-delete'),
  T('Скасуйте помилку','Поверніть випадково видалений файл.','KeyZ',['Ctrl','Z'],'cyber-undo',{ctrl:true}),
  T('Збережіть запис','Зафіксуйте результат.','KeyS',['Ctrl','S'],'cyber-save',{ctrl:true})]),
 L('Фінальна цифрова місія','Змішаний сценарій без підказок',[
  T('Знайдіть потрібне','Відкрийте пошук.','KeyF',['Ctrl','F'],'doc-find',{ctrl:true}),
  T('Відредагуйте клітинку','Перейдіть у редагування клітинки.','F2',['F2'],'sheet-edit'),
  T('Порахуйте суму','Вставте автосуму.','Equal',['Alt','='],'sheet-sum',{alt:true}),
  T('Створіть слайд','Додайте новий слайд.','KeyM',['Ctrl','M'],'slide-new',{ctrl:true}),
  T('Надішліть повідомлення','Надішліть підготовлений текст.','Enter',['Enter'],'chat-send'),
  T('Збережіть роботу','Збережіть підсумковий документ.','KeyS',['Ctrl','S'],'doc-save',{ctrl:true})])
]}
};

const MODULES=[
 {n:1,name:'Основи роботи з ПК та Windows',short:'Windows',desc:'Поточний сектор: базові комбінації та робота з файлами.',current:true},
 ...Object.keys(SECTORS).map(k=>({n:+k,name:SECTORS[k].name,short:SECTORS[k].short,desc:SECTORS[k].mobile||'10 рівнів практики з реальним візуальним результатом.'}))
];
let profile={};try{profile=JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){};
function sectorDone(n){const a=profile[n]||[];return Array.isArray(a)?a.length:0}
function save(){try{localStorage.setItem(STORE,JSON.stringify(profile))}catch(e){}}
let phase='hub',sector=2,level=0,task=0,seconds=0,errors=0,hints=0,feedback='idle',pressed=new Set(),paused=false,locked=false,timer=null,nextTimer=null,captureState={fullscreen:false,keyboardLock:false},changingFullscreen=false;
function setCompleted(s,l){profile[s]=Array.isArray(profile[s])?profile[s]:[];if(!profile[s].includes(l+1))profile[s].push(l+1);profile[s].sort((a,b)=>a-b);save()}
function unlocked(s,l){return l===0||(profile[s]||[]).includes(l)}
function hub(){return `<section class="ds-hub"><div class="ds-hub-head"><div><span class="ds-kicker">VIDLIK · КЛАВІАТУРНИЙ ПОЛІГОН</span><h1>Сектори 01–08</h1><p>Desktop-тренажер: системні та browser-shortcuts винесені в мобільну версію.</p></div><button class="ds-back" id="ds-sector1">← Поточний сектор 01</button></div><div class="ds-module-grid">${MODULES.map(m=>{const d=m.n===1?10:sectorDone(m.n),p=Math.round(d/10*100);return `<button class="ds-module ${m.n===6||m.n===7?'mobile-only':''}" data-sector="${m.n}"><span class="ds-num">${String(m.n).padStart(2,'0')}</span><strong>${esc(m.name)}</strong><small>${esc(m.desc)}</small><div class="ds-progress"><i style="--p:${p}%"></i></div></button>`}).join('')}</div></section>`}
function levels(){const s=SECTORS[sector];return `<section class="ds-levels"><div class="ds-levels-head"><div><span class="ds-kicker">СЕКТОР ${String(sector).padStart(2,'0')} · РІВНІ 01–10</span><h2>${esc(s.name)}</h2>${s.mobile?`<span class="ds-mobile-badge">${esc(s.mobile)}</span>`:''}</div><button class="ds-back" id="ds-back-hub">← Сектори</button></div><div class="ds-level-grid">${s.levels.map((l,i)=>{const open=unlocked(sector,i),done=(profile[sector]||[]).includes(i+1);return `<button class="ds-level ${done?'done':''}" ${open?'':'disabled'} data-level="${i}"><span class="ds-kicker">РІВЕНЬ</span><span class="ds-lnum">${String(i+1).padStart(2,'0')}</span><small>${esc(l.name)}<br>${esc(l.desc)}</small>${done?'<span class="ds-check">✓</span>':''}</button>`}).join('')}</div></section>`}
function current(){return SECTORS[sector].levels[level].tasks[task]}
function progress(){const total=SECTORS[sector].levels[level].tasks.length,done=task+(feedback==='correct'?1:0);return {total,done,pct:Math.round(done/total*100)}}
function keyState(){if(feedback==='correct')return current().labels;const live=[...pressed].map(c=>c.startsWith('Key')?c.slice(3):c==='ControlLeft'||c==='ControlRight'?'Ctrl':c==='ShiftLeft'||c==='ShiftRight'?'Shift':c==='AltLeft'||c==='AltRight'?'Alt':c==='ArrowLeft'?'←':c==='ArrowRight'?'→':c==='ArrowUp'?'↑':c==='ArrowDown'?'↓':c);return live.length?live:(hints?current().labels:['—','—'])}
function play(){const s=SECTORS[sector],l=s.levels[level],t=current(),p=progress(),inputMode=keyboard.mode(t);return `<section class="ds-task" data-input-mode="${inputMode}"><span class="ds-kicker">РІВЕНЬ ${String(level+1).padStart(2,'0')} · ${esc(l.name)}</span><label>ЗАВДАННЯ</label><h3>${esc(t.title)}</h3></section><section class="ds-progresshud"><div class="ds-progress-head"><span>ПРОГРЕС ТРЕНУВАННЯ</span><b>${p.pct}%</b></div><div class="ds-track"><i style="--p:${p.pct}%"></i></div><div class="ds-progress-meta"><span>${p.done} виконано</span><span>${p.total-p.done} залишилось</span></div></section><section class="ds-hud"><div class="time"><span>Час</span><b id="ds-time">${fmt(seconds)}</b></div><div class="err"><span>Помилки</span><b>${errors}</b></div></section><div class="ds-monitor">${scene(t,feedback==='correct')}</div><section class="ds-reader ${feedback}"><label>${feedback==='wrong'?'Спробуйте іншу комбінацію':feedback==='correct'?'Прийнято':'Очікується комбінація клавіш'}</label><div class="ds-keys">${keyState().map(k=>`<span class="ds-key">${esc(k)}</span>`).join('')}</div></section>${level===9?'':`<button class="ds-hint" id="ds-hint">ПІДКАЗКА · F1</button>`}<button class="ds-exit" id="ds-exit">ВИЙТИ · ESC</button>${paused?pauseMarkup():''}`}
function badge(text){return `<div class="ds-badge">✓ ${esc(text)}</div>`}
function os(inner,okText){return `<div class="ds-screen"><div class="ds-osbar"><span>VIDLIK OS</span><span>УКР · 08:00</span></div><div class="ds-scene">${inner}</div>${okText?badge(okText):''}</div>`}
function docScene(type,ok){let tool='',cls='',line='Гарячі клавіші пришвидшують типові робочі дії.',extra='',okText='';if(type==='bold'){tool='B';cls=ok?'bold':'';okText='Напівжирний застосовано'}if(type==='italic'){tool='I';cls=ok?'italic':'';okText='Курсив застосовано'}if(type==='underline'){tool='U';cls=ok?'underline':'';okText='Підкреслення застосовано'}if(type==='find'){extra=ok?'<div class="ds-search">⌕ типові · 1/1</div>':'';if(ok)line='Гарячі клавіші пришвидшують <span class="ds-selected">типові</span> робочі дії.';okText='Пошук відкрито'}if(type==='link'){if(ok)line='Гарячі клавіші пришвидшують <span class="ds-link">типові робочі дії</span>.';okText='Посилання додано'}if(['left','center','right','justify'].includes(type)){cls='';line=`<div class="${ok?type:''}">Гарячі клавіші пришвидшують типові робочі дії.</div>`;okText='Вирівнювання застосовано'}if(type==='home'){line=(ok?'<span class="ds-caret"></span>':'')+'Гарячі клавіші пришвидшують типові робочі дії.';okText='Курсор на початку'}if(type==='end'){line='Гарячі клавіші пришвидшують типові робочі дії.'+(ok?'<span class="ds-caret"></span>':'');okText='Курсор у кінці'}if(type==='word-left'){line='Гарячі клавіші '+(ok?'<span class="ds-caret"></span>':'')+'пришвидшують типові робочі дії.';okText='Перехід на слово ліворуч'}if(type==='word-right'){line='Гарячі клавіші пришвидшують '+(ok?'<span class="ds-caret"></span>':'')+'типові робочі дії.';okText='Перехід на слово праворуч'}if(type==='del-prev'){line=ok?'Гарячі клавіші типові робочі дії.':'Гарячі клавіші пришвидшують типові робочі дії.';okText='Попереднє слово видалено'}if(type==='del-next'){line=ok?'Гарячі клавіші пришвидшують робочі дії.':'Гарячі клавіші пришвидшують типові робочі дії.';okText='Наступне слово видалено'}if(type==='linebreak'){line=ok?'Гарячі клавіші пришвидшують<br>типові робочі дії.':'Гарячі клавіші пришвидшують типові робочі дії.';okText='Рядок перенесено'}if(type==='pagebreak'){extra=ok?'<div class="ds-pagebreak"></div>':'';okText='Створено нову сторінку'}if(type==='select'){if(ok){cls='';line='<span class="ds-selected">Гарячі клавіші пришвидшують типові робочі дії.</span>'}okText='Увесь текст виділено'}if(type==='copy')okText='Фрагмент скопійовано';if(type==='cut'){if(ok)line='<span style="opacity:.35">Гарячі клавіші пришвидшують типові робочі дії.</span>';okText='Фрагмент вирізано'}if(type==='paste'){if(ok)extra='<div style="margin-top:.8em;color:#0b7e75">Цифрова грамотність — копія</div>';okText='Фрагмент вставлено'}if(type==='undo'){if(ok)extra='<div style="margin-top:.8em;color:#0b7e75">↶ Попередній стан відновлено</div>';okText='Дію скасовано'}if(type==='save')okText='Документ збережено';if(type==='print'&&ok){return os(`<div class="ds-doc"><div class="ds-docbar"><span>Друк</span><span>— □ ×</span></div><div class="ds-print"><div class="ds-print-page"><b>Цифрова грамотність</b><p>Гарячі клавіші пришвидшують типові робочі дії.</p></div><div class="ds-print-side"><strong>Попередній перегляд</strong><p>1 сторінка</p></div></div></div>`,'Перегляд друку')}const paper=`<div class="ds-paper"><span class="ds-title ${cls}">Цифрова грамотність</span><div class="ds-line">${line}</div>${extra}</div>`;return os(`<div class="ds-doc"><div class="ds-docbar"><span>Навчальний документ</span><span>— □ ×</span></div><div class="ds-toolbar"><span class="ds-tool ${tool==='B'&&ok?'on':''}">B</span><span class="ds-tool ${tool==='I'&&ok?'on':''}">I</span><span class="ds-tool ${tool==='U'&&ok?'on':''}">U</span></div>${paper}</div>`,ok?okText:'')}
function sheetScene(type,ok){let cells=[];for(let r=0;r<6;r++)for(let c=0;c<6;c++){let text=r===0?(c===0?'':String.fromCharCode(65+c)):(c===0?String(r):String((r)*10+c));let cls=(r===0||c===0)?'head':'';let idx=r*6+c;if(!ok&&idx===15)cls+=' active';if(ok){if(type.startsWith('nav-')){const target={right:17,down:27,left:13,up:9}[type.slice(4)];if(idx===target)cls+=' active'}if(type.startsWith('range-')&&r>=2&&r<=4&&c>=2&&c<=4)cls+=' range';if(type==='col'&&c===3)cls+=' colSel';if(type==='row'&&r===3)cls+=' rowSel';if(type==='fill-down'&&c===3&&r>=2&&r<=5)text='42';if(type==='fill-right'&&r===3&&c>=2&&c<=5)text='42';if(type==='sum'&&idx===28)text='=SUM(D1:D3)';if(type==='date'&&idx===15)text='03.09.2026';if(type==='time'&&idx===15)text='16:23';if(type==='formulas'&&r>0&&c>0)text=`=${String.fromCharCode(64+c)}${r}*2`}cells.push(`<div class="ds-cell ${cls} ${ok&&type==='filter'&&r===0&&c>0?'ds-filter':''}">${text}</div>`)}let formula=ok&&type==='edit'?'fx  =B2*2':'fx';let label={edit:'Режим редагування',sum:'Автосума вставлена',date:'Дата вставлена',time:'Час вставлено',filter:'Фільтри увімкнено',formulas:'Показ формул увімкнено','fill-down':'Заповнено вниз','fill-right':'Заповнено праворуч',col:'Стовпець виділено',row:'Рядок виділено'}[type]||'Дію виконано';return os(`<div class="ds-sheet"><div class="ds-formula"><b>${formula}</b></div><div class="ds-grid">${cells.join('')}</div></div>`,ok?label:'')}
function slideScene(type,ok){let thumbs='<div class="ds-thumb active"></div><div class="ds-thumb"></div>',objCls='',obj='Заголовок',okText='';if(type==='new'&&ok){thumbs+='<div class="ds-thumb"></div>';okText='Новий слайд створено'}if(type==='duplicate'&&ok){thumbs+='<div class="ds-thumb active"></div>';okText='Слайд дубльовано'}if(type==='copy')okText='Об’єкт скопійовано';if(type==='paste'&&ok){obj='Заголовок · копія';okText='Об’єкт вставлено'}if(type==='cut'&&ok){obj='';okText='Об’єкт вирізано'}if(type==='undo')okText='Зміну скасовано';if(type==='redo')okText='Зміну повторено';if(type==='group'){objCls=ok?'grouped':'';okText='Об’єкти згруповано'}if(type==='ungroup')okText='Об’єкти розгруповано';if(type==='link'){if(ok)obj='🔗 Заголовок';okText='Посилання додано'}if(type==='copy-format')okText='Формат скопійовано';if(type==='apply-format'){objCls=ok?'formatted':'';okText='Формат застосовано'}if(type.startsWith('move-')){objCls=ok?'moved':'';okText='Об’єкт переміщено'}if(type.startsWith('resize-')){objCls=ok?'resized':'';okText='Розмір змінено'}return os(`<div class="ds-slideapp"><div class="ds-thumbs">${thumbs}</div><div class="ds-slide">${obj?`<div class="ds-object ${objCls}">${obj}</div>`:''}</div></div>`,ok?okText:'')}
function chatScene(type,ok){let compose='Підготуйте коротке повідомлення',messages='<div class="ds-bubble">Привіт! Надішли, будь ласка, файл.</div>',okText='';if(type==='send'&&ok){messages+='<div class="ds-bubble sent">Файл надіслано.</div>';compose='';okText='Повідомлення надіслано'}if(type==='ctrl-send'&&ok){messages+='<div class="ds-bubble sent">Готово ✓</div>';compose='';okText='Надсилання підтверджено'}if(type==='newline'&&ok){compose='Перший рядок<br>Другий рядок';okText='Створено новий рядок'}if(type==='link'&&ok){compose='<span class="ds-link">https://vidlik.example</span>';okText='Посилання додано'}if(type==='find'&&ok){messages='<div class="ds-bubble">Привіт! Надішли, будь ласка, <span class="ds-selected">файл</span>.</div>';okText='Повідомлення знайдено'}if(type==='select'&&ok){compose='<span class="ds-selected">Підготуйте коротке повідомлення</span>';okText='Текст виділено'}if(type==='copy')okText='Текст скопійовано';if(type==='paste'&&ok){compose+=' · вставлено';okText='Текст вставлено'}if(type==='cut'&&ok){compose='';okText='Текст вирізано'}if(type==='undo'&&ok){compose='Підготуйте коротке повідомлення';okText='Зміну скасовано'}if(type==='redo'&&ok){compose='Підготуйте коротке повідомлення · зміна';okText='Зміну повторено'}let focus=type==='tab'&&ok?' ds-focus':type==='shift-tab'&&ok?' ds-focus':'';return os(`<div class="ds-chat"><div class="ds-chathead">Командний чат</div><div class="ds-messages${type==='shift-tab'&&ok?' ds-focus':''}">${messages}</div><div class="ds-compose"><div class="ds-input${focus}">${compose}</div></div></div>`,ok?okText:'')}
function webScene(type,ok){let y='18%',zoom='100%',cards=[`Навчальна платформа VIDLIK`,`Документація курсу`,`Цифрова грамотність`],okText='';if(['end','pagedown','space'].includes(type)&&ok)y='70%';if(['pageup','shift-space'].includes(type)&&ok)y='28%';if(type==='home'&&ok)y='0%';if(type==='zoom-plus'&&ok)zoom='110%';if(type==='zoom-minus'&&ok)zoom='90%';if(type==='zoom-reset'&&ok)zoom='100%';if(type==='find'&&ok)cards[2]='Цифрова <span class="ds-selected">грамотність</span>';let focus=ok&&['tab','shift-tab','enter','arrow-right','arrow-down'].includes(type)?1:-1;okText={find:'Пошук відкрито',home:'Верх сторінки',end:'Кінець сторінки',pageup:'Прокручено вгору',pagedown:'Прокручено вниз',space:'Прокручено вниз','shift-space':'Прокручено вгору','zoom-plus':'Масштаб 110%','zoom-minus':'Масштаб 90%','zoom-reset':'Масштаб 100%',tab:'Фокус переміщено','shift-tab':'Фокус повернуто',enter:'Елемент відкрито','arrow-right':'Фокус праворуч','arrow-down':'Фокус униз'}[type]||'Дію виконано';return os(`<div class="ds-web"><div class="ds-webbar"><span>VIDLIK Online</span><span style="margin-left:auto">🔍</span></div><div class="ds-webbody">${cards.map((c,i)=>`<div class="ds-webcard ${i===focus?'focus':''}">${c}</div>`).join('')}<div class="ds-scroll"><i style="--y:${y}"></i></div><div class="ds-zoom">${zoom}</div></div></div>`,ok?okText:'')}
function cyberScene(type,ok){let cls='active',name='unknown-file.exe',action='Перевірка файлу',okText='';if(type==='delete'&&ok){cls='deleted';okText='Файл переміщено до кошика'}if(type==='hard-delete'&&ok){cls='deleted';okText='Файл видалено без кошика'}if(type==='undo'&&ok){cls='active';okText='Файл відновлено'}if(type==='rename'&&ok){cls='renamed active';okText='Файл позначено для карантину'}if(type==='select'&&ok){cls='active';okText='Усі файли виділено'}if(type==='copy'&&ok){action='SHA-256 скопійовано';okText='Контрольну суму скопійовано'}if(type==='save'&&ok){action='Інцидент збережено';okText='Запис збережено'}if(type==='find'&&ok){action='Знайдено IOC: example.test';okText='Індикатор знайдено'}if(type==='tab'&&ok)action='Фокус: Карантин';if(type==='shift-tab'&&ok)action='Фокус: Скасувати';if(type==='enter'&&ok){action='Безпечну дію підтверджено';okText='Дію підтверджено'}return os(`<div class="ds-cyber"><div class="ds-secfile ${cls}"><span>ПІДОЗРІЛИЙ ФАЙЛ</span><strong>${name}</strong><small>SHA-256: 8e9f...2a1c</small></div><div class="ds-secaction"><span>SECURITY WORKFLOW</span><strong>${action}</strong><small>Навчальний режим</small></div></div>`,ok?okText:'')}
function scene(t,ok){const [domain,...rest]=t.scene.split('-'),type=rest.join('-');if(domain==='doc')return docScene(type,ok);if(domain==='sheet')return sheetScene(type,ok);if(domain==='slide')return slideScene(type,ok);if(domain==='chat')return chatScene(type,ok);if(domain==='web')return webScene(type,ok);if(domain==='cyber')return cyberScene(type,ok);return os('<div>VIDLIK</div>',ok?'Дію виконано':'')}
function pauseMarkup(){const t=current();return `<div class="ds-pause"><section class="ds-pause-card"><div class="ds-pause-icon"></div><h2>Призупинено</h2><div class="ds-pause-current">Поточне завдання<strong>${esc(t.title)}</strong></div><button class="ds-primary" id="ds-resume">▶ ПРОДОВЖИТИ</button><div class="ds-pause-actions"><button id="ds-repeat-task">↻ Повторити завдання</button><button id="ds-restart">⟳ Перезапустити рівень</button><button id="ds-levels">⌂ До рівнів</button></div></section></div>`}
function result(){const l=SECTORS[sector].levels[level],score=Math.max(0,1000-errors*25-hints*10+Math.max(0,120-seconds));return `<section class="ds-result"><div class="ds-seal">✓</div><span class="ds-kicker">СЕКТОР ${String(sector).padStart(2,'0')} · РІВЕНЬ ${String(level+1).padStart(2,'0')}</span><h1>${score} XP</h1><p>${esc(l.name)} — виконано.</p><p class="ds-muted">Час ${fmt(seconds)} · Помилки ${errors} · Підказки ${hints}</p><div class="ds-actions"><button class="ds-primary" id="ds-next">${level<9?'Наступний рівень →':'До сектору'}</button><button class="ds-secondary" id="ds-repeat">↻ Повторити</button></div></section>`}
function render(){if(phase==='hub')app.innerHTML=hub();else if(phase==='levels')app.innerHTML=levels();else if(phase==='complete')app.innerHTML=result();else app.innerHTML=play();bind()}
function bind(){document.querySelectorAll('[data-sector]').forEach(b=>b.addEventListener('click',()=>{const n=+b.dataset.sector;if(n===1){location.href='game.html';return}sector=n;phase='levels';render()}));document.getElementById('ds-sector1')?.addEventListener('click',()=>location.href='game.html');document.getElementById('ds-back-hub')?.addEventListener('click',()=>{phase='hub';render()});document.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>start(+b.dataset.level)));document.getElementById('ds-hint')?.addEventListener('click',()=>{hints++;render()});document.getElementById('ds-exit')?.addEventListener('click',leaveLevel);document.getElementById('ds-resume')?.addEventListener('click',resumeLevel);document.getElementById('ds-repeat-task')?.addEventListener('click',()=>{clearTimeout(nextTimer);feedback='idle';locked=false;pressed.clear();resumeLevel()});document.getElementById('ds-restart')?.addEventListener('click',()=>start(level));document.getElementById('ds-levels')?.addEventListener('click',leaveLevel);document.getElementById('ds-next')?.addEventListener('click',()=>{if(level<9)start(level+1);else leaveLevel()});document.getElementById('ds-repeat')?.addEventListener('click',()=>start(level))}
async function start(i){if(!unlocked(sector,i))return;clearTimeout(nextTimer);level=i;task=0;seconds=errors=hints=0;feedback='idle';pressed.clear();paused=false;locked=false;phase='play';run();render();changingFullscreen=true;captureState=await keyboard.capture(shell);changingFullscreen=false;focusTask()}
async function resumeLevel(){paused=false;run();render();changingFullscreen=true;captureState=await keyboard.capture(shell);changingFullscreen=false;focusTask()}
async function leaveLevel(){stop();paused=false;phase='levels';pressed.clear();locked=false;changingFullscreen=true;await keyboard.release(true);changingFullscreen=false;render()}
function run(){stop();timer=setInterval(()=>{if(phase==='play'&&!paused){seconds++;const e=document.getElementById('ds-time');if(e)e.textContent=fmt(seconds)}},1000)}function stop(){clearInterval(timer);timer=null;clearTimeout(nextTimer)}
function focusTask(){setTimeout(()=>{const e=document.querySelector('.ds-task h3');if(e){e.animate([{opacity:.35,transform:'translateX(-5px)'},{opacity:1,transform:'translateX(0)'}],{duration:550,easing:'ease-out'})}},60)}
document.addEventListener('fullscreenchange',()=>{if(changingFullscreen||phase!=='play')return;if(!document.fullscreenElement){captureState={fullscreen:false,keyboardLock:false};paused=true;stop();pressed.clear();render()}});
window.addEventListener('keydown',e=>{if(phase!=='play')return;if(paused){if(e.code==='Escape'){e.preventDefault();resumeLevel()}return}if(e.code==='Escape'){e.preventDefault();paused=true;stop();pressed.clear();render();return}if(e.code==='F1'&&level!==9){e.preventDefault();hints++;render();return}if(keyboard.shouldPrevent(e,true))e.preventDefault();if(e.repeat||locked)return;pressed.add(e.code);if(keyboard.isModifier(e.code)){render();return}const t=current();const ok=keyboard.matches(e,t);if(ok){locked=true;feedback='correct';render();clearTimeout(nextTimer);nextTimer=setTimeout(()=>{locked=false;pressed.clear();feedback='idle';if(task>=SECTORS[sector].levels[level].tasks.length-1){setCompleted(sector,level);phase='complete';stop();keyboard.release(false);render()}else{task++;render();focusTask()}},1500)}else{errors++;feedback='wrong';render();setTimeout(()=>{if(feedback==='wrong'&&!locked){feedback='idle';render()}},550)}},true);
window.addEventListener('keyup',e=>{pressed.delete(e.code);if(phase==='play'&&!paused&&!locked)render()},true);
render();
})();

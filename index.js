'use strict';

const path = require('path'); // Модуль для работы с путями
const fs = require('fs'); // Модуль для работы с файловой системой
const through = require('through2'); // Модуль для создания потоков
const glob = require('glob'); // Модуль для поиска файлов по шаблонам
const minimatch = require('minimatch'); // Модуль для проверки соответствия путей

// Регулярное выражение для поиска @import и @use
const IMPORT_USE_RE = /^([ \t]*(?:\/\*.*)?)@(import|use|forward)\s+["']([^"']+\*[^"']*(?:\.scss|\.sass)?)["'];?([ \t]*(?:\/[/*].*)?)$/gm;

// Функция для преобразования путей в формат с прямыми слэшами
const slash = (pth) => pth.split(path.sep).join('/');

// Основная функция
function gulpGlobSass(options = {}) {
	return through.obj((file, env, callback) => transform(file, env, callback, options));
}

// Функция для обработки содержимого файла
function transform(file, env, callback, options = {}) {
	const baseDir = options.baseDir || process.cwd(); // Определяем базовую директорию
	const includePaths = (options.includePaths || []).map(p => path.join(path.normalize(p), '/')); // Включаемые пути
	const isSass = path.extname(file.path) === '.sass'; // Проверка, является ли файл SASS
	const relativeBase = path.relative(baseDir, path.dirname(file.path)); // Относительная база от базовой директории
	const ignorePaths = options.ignorePaths || []; // Игнорируемые пути
	const searchBases = [relativeBase, ...includePaths]; // Каталоги для поиска файлов

	let contents = file.contents.toString('utf-8'); // Преобразуем содержимое файла в строку
	const linesCount = contents.split('\n').length; // Количество строк в файле

	for (let i = 0; i < linesCount; i++) {
		const result = IMPORT_USE_RE.exec(contents); // Ищем строки @import, @use или @forward с шаблоном

		if (result) {
			const [rule, startComment, directive, globPattern, endComment] = result; // Деструктуризация результата

			const files = searchBases.reduce((acc, basePath) => {
				const absoluteBasePath = slash(path.join(baseDir, basePath)); // Абсолютный путь для поиска
				const matchedFiles = glob.sync(slash(path.join(absoluteBasePath, globPattern)), { cwd: absoluteBasePath }); // Ищем файлы
				return acc.length ? acc : matchedFiles; // Используем файлы из первого подходящего каталога
			}, []);

			const directives = files
				.filter(filename => filename !== file.path && isSassOrScss(filename)) // Исключаем текущий файл и нерелевантные файлы
				.filter(filename => !ignorePaths.some(ignorePath => minimatch(filename, ignorePath))) // Исключаем файлы из ignorePaths
				.map(filename => `@${directive} "${slash(path.relative(relativeBase, filename))}"${isSass ? '' : ';'}`); // Генерация строк @import или @use

			if (startComment) directives.unshift(startComment); // Добавляем комментарий перед конструкцией
			if (endComment) directives.push(endComment); // Добавляем комментарий после конструкции

			contents = contents.replace(rule, directives.join('\n')); // Заменяем строку @import/@use на список файлов
			file.contents = Buffer.from(contents); // Обновляем содержимое файла
		}
	}

	callback(null, file); // Передаем обработанный файл дальше
}

// Проверка, является ли файл SASS/SCSS
function isSassOrScss(filename) {
	return !fs.statSync(filename).isDirectory() && path.extname(filename).match(/\.sass|\.scss/i);
}

// Экспортируем функцию для использования через require
module.exports = gulpGlobSass;
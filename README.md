# Guide to Using the `gulpGlobSass` Plugin

The `v` plugin simplifies working with SASS/SCSS files by automatically replacing `@import`, `@use`, and `@forward` constructions that use glob patterns with an actual list of matching files. This helps automate and streamline the process of including style files in projects. Based on [gulp-sass-glob](https://www.npmjs.com/package/gulp-sass-glob) plugin. Added support for @use and @forward. Added base directory setting.

---

## Installation

1. **Download the plugin**: Save the plugin code to a file, for example, `gulp-sass-glob.js`.
2. **Install the required dependencies (It will be automatic)**:

```bash
npm install gulp-sass-glob --save-dev
```

3. **Include the plugin in your project**.

---

## Usage

1. **Import the plugin**:
```javascript
const gulpGlobSass = require('./path-to-plugin/gulp-sass-glob');
```

2. **Example Gulp task**:
```javascript
const gulp = require('gulp');
const gulpGlobSass = require('./path-to-plugin/gulp-sass-glob');
const sass = require('gulp-sass')(require('sass')); // Example with Gulp Sass

gulp.task('styles', () => {
  return gulp.src('src/**/*.scss') // Path to SASS/SCSS files
    .pipe(gulpGlobSass({
      baseDir: __dirname,            // Base directory (default is process.cwd())
      includePaths: ['src/styles'],  // Paths to search for files
      ignorePaths: ['**/_ignore.scss'] // Ignored files
    }))
    .pipe(sass()) // Compile SCSS to CSS
    .pipe(gulp.dest('dist')); // Output folder
});
```

---

## Configuration

You can customize the plugin's behavior by passing a configuration object to `gulpSassGlob`.

### Available Options:
- **`baseDir`** (string, default is `process.cwd()`): 
  - Specifies the base directory for file searches.
  - Example: `baseDir: __dirname`.

- **`includePaths`** (array of strings, default is empty):
  - Additional paths to search for files.
  - Example: `includePaths: ['src/styles', 'node_modules']`.

- **`ignorePaths`** (array of strings, default is empty):
  - Paths or file patterns to ignore.
  - Example: `ignorePaths: ['**/_ignore.scss', '**/temp/*.scss']`.

---

## Examples

### Example 1: Automatic File Inclusion
If the `main.scss` file contains the line:
```scss
@use "components/*";
```

The plugin will replace it with:
```scss
@use "components/button.scss";
@use "components/header.scss";
@use "components/footer.scss";
```
(The file list is generated automatically based on the contents of the `components` directory.)

### Example 2: Ignoring Files
With the configuration:
```javascript
ignorePaths: ['**/_ignore.scss']
```

Files matching the pattern will not be included in the import list.

### Example 3: Working with SASS
If the file has a `.sass` extension, the plugin will generate lines without a semicolon:
```sass
@use "components/button"
@use "components/header"
```

---

## Advantages

1. **Automation**: Eliminates the need to manually list imported files.
2. **Glob Pattern Support**: Flexible file inclusion using masks.
3. **Customizable**: Allows ignoring specific files or specifying additional paths.
4. **Cross-Platform**: Ensures correct path handling regardless of the OS.

---

## Compatibility

The plugin is compatible with:
- **Gulp** (version 4 and above).
- Files with `.scss` and `.sass` extensions.

---

## Possible Errors

1. **File Not Found**:
   - Check the glob pattern for correctness.
   - Ensure the paths in `includePaths` are specified correctly.

2. **Incorrect Syntax**:
   - Make sure `.sass` files do not use semicolons, and `.scss` files do.

---

import gulp from 'gulp';
import htmlMin from 'gulp-htmlmin';
import liveServer from 'browser-sync';
import { deleteAsync } from 'del';
import autoprefixer from 'gulp-autoprefixer';
import VanillaSass from 'sass';
import gulpSass from 'gulp-sass';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import newer from 'gulp-newer';
import imageMin from 'gulp-imagemin';
import webp from 'gulp-webp';
import webpHTML from 'gulp-webp-html';
import fonter from 'gulp-fonter';
import concat from 'gulp-concat';

const production = process.argv.includes("--production");
const development = !production;
const sass = gulpSass(VanillaSass);
const {src, dest, watch, parallel, series, task} = gulp;
const paths = {
    styles : {
        src : 'src/styles/**/*.scss',
        dest: 'dist/css/',
    },
    scripts : {
        src : 'src/scripts/**/*.js',
        dest: 'dist/js/'
    },
    html : {
        src : 'src/html/**/*.html',
        dest : 'dist/html/'
    },
    img : {
        src : 'src/img/**/*.{png,jpg,jpeg,webp,svg}',
        dest : 'dist/img/'
    },
    fonts : {
        src : 'src/fonts/**/*.{ttf, woff, woff2, eot}',
        dest : 'dist/fonts/'
    },
}

// file processing

const clear = () => {
    return deleteAsync('dist/');
}

const scss = () => {
    return src(paths.styles.src, {sourcemaps : true})
    .pipe(concat('main.scss'))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(dest(paths.styles.dest, {sourcemaps : true}))
    .pipe(liveServer.stream());
}

const html = () => {
    return src(paths.html.src)
    .pipe(webpHTML())
    .pipe(htmlMin({
        collapseWhitespace : production,
    }))
    .pipe(dest(paths.html.dest))
    .pipe(liveServer.stream());
}

const js = () => {
    return src(paths.scripts.src, {sourcemaps : development})
    .pipe(babel())
    .pipe(uglify())
    .pipe(dest(paths.scripts.dest, {sourcemaps : development}))
    .pipe(liveServer.stream());
}

const img = () => {
    return src(paths.img.src)
    .pipe(newer(paths.img.dest))
    .pipe(webp())
    .pipe(dest(paths.img.dest))
    .pipe(src(paths.img.src))
    .pipe(newer(paths.img.dest))
    .pipe(imageMin({
        verbose : true,
    }))
    .pipe(dest(paths.img.dest))
}

const fonts = () => {
    return src(paths.fonts.src)
    .pipe(newer(paths.fonts.dest))
    .pipe(fonter({
        formats : ["ttf", "woff"],
    }))
    .pipe(dest(paths.fonts.dest))
}

// liveServer and watcher

const server = () => {
    liveServer.init({
        server : {
            baseDir : "./dist/",
        },
        startPath : "html/index.html",
    });
}

const watcher = () => {
    watch(paths.html.src, html);
    watch(paths.styles.src, scss);
    watch(paths.scripts.src, js);
    watch(paths.img.src, img);
    watch(paths.fonts.src, fonts);
}


// assembly

const build = series(
    clear,
    parallel(html, scss, js, img, fonts), 
);

const dev = series(
    build,
    parallel(watcher, server),
);

export default development ? dev : build;
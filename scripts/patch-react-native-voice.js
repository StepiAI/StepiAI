const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-native-voice',
  'voice',
  'android',
  'build.gradle',
);

if (!fs.existsSync(buildGradlePath)) {
  process.exit(0);
}

const nextBuildGradle = `apply plugin: 'com.android.library'

repositories {
    mavenLocal()
    google()
    mavenCentral()
    maven {
        // For developing the library outside the context of the example app, expect \`react-native\`
        // to be installed at \`./node_modules\`.
        url "$projectDir/../node_modules/react-native/android"
    }
    maven {
        // For developing the example app.
        url "$projectDir/../../react-native/android"
    }
}

android {
    namespace "com.wenkesj.voice"
    compileSdk rootProject.ext.compileSdkVersion

    defaultConfig {
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

buildscript {
    if (project == rootProject) {
        repositories {
            google()
            mavenCentral()
        }
        dependencies {
            classpath 'com.android.tools.build:gradle:3.3.2'

            // NOTE: Do not place your application dependencies here; they belong
            // in the individual module build.gradle files
        }
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    testImplementation 'junit:junit:4.12'
    implementation 'androidx.annotation:annotation:1.9.1'
    implementation 'com.facebook.react:react-android'
}
`;

fs.writeFileSync(buildGradlePath, nextBuildGradle);

import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root',
})
export class FfmpegService {
  // To Prevent Duplicate Uploads since SS generation may take a while
  isRunning: boolean = false;

  // To check the Web Assembly Service is Ready for Processing or Not
  isReady = false;
  private ffmpeg;

  constructor() {
    this.ffmpeg = createFFmpeg({ log: true });
  }

  async init() {
    if (this.isReady) {
      return;
    }

    await this.ffmpeg.load();
    this.isReady = true;
  }

  async getScreenshots(file: File) {
    // SS Generation Initiated
    this.isRunning = true;

    const data = await fetchFile(file);

    this.ffmpeg.FS('writeFile', file.name, data);

    // For Multiple ss
    const seconds = [1, 2, 3];
    const commands: string[] = [];

    seconds.forEach((second) => {
      commands.push(
        // Input
        '-i',
        file.name, // '-i' to look into Newly Created File System , file.name to get the video just uploaded

        // Output options
        '-ss',
        `00:00:0${second}`, // '-ss' for ScreenShot , 'hh:mm:ss' Timimg where to get SS
        '-frames:v',
        '1', // '-frames:v' for Capturing a single frame in a second coz there could be multiple according to FPS
        '-filter:v',
        'scale=510:-1', // '-filter:v' for Resizing our image according to our Aspect ratio by passing width:height to scale function. -1 will be used to preserve aspect ratio

        // Output
        `output_0${second}.png`
      );
    });

    // console.log(commands);

    await this.ffmpeg.run(
      // Spearding Coz Run function wants every argument as a List of strings not array
      ...commands
    );

    // For generating single SS

    // await this.ffmpeg.run(
    //   // Input
    //   '-i',
    //   file.name,

    //   // Output options
    //   '-ss',
    //   '00:00:01',
    //   '-frames:v',
    //   '1',
    //   '-filter:v',
    //   'scale=510:-1',

    //   // Output
    //   'output_01.png'
    // );

    // STroring URL or generated SS by converting SS from Binary Array To String
    const screenshots: string[] = [];

    // To make Sure End Array has the same number of URLS as Timestamps passed
    seconds.forEach((second) => {
      const screenshotFile = this.ffmpeg.FS(
        'readFile',
        `output_0${second}.png`
      );

      //Readfile Function returns Blob(Binary Large Object). An alternative to store Binary Data But they are Immutable and connot be Updated
      const screenshotBlob = new Blob([screenshotFile.buffer], {
        type: 'image/png',
      });

      const screenshotUrl = URL.createObjectURL(screenshotBlob);

      screenshots.push(screenshotUrl);
    });

    // SS generation Done
    this.isRunning = false;

    return screenshots;
  }

  // To get Blob from URL In order To Upload to FireBase
  async blobFromUrl(url: string) {
    // We can Use Fetch function to get Data from memory URL / Will Work
    const response = await fetch(url);

    // Get the blob from response
    const blob = await response.blob();

    return blob;
  }
}

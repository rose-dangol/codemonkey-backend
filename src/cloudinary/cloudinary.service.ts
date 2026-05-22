import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(error);

          if (!result) {
            return reject(new Error('Upload failed: No result returned'));
          }

          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  getPublicIdFromUrl(url: string): string | null {
    try {
      const parts = url.split('/image/upload/');
      if (parts.length < 2) return null;

      const pathWithExtension = parts[1];
      const pathParts = pathWithExtension.split('/');

      if (pathParts[0].match(/^v\d+$/)) {
        pathParts.shift();
      }

      const publicIdWithExtension = pathParts.join('/');
      const lastDotIndex = publicIdWithExtension.lastIndexOf('.');
      if (lastDotIndex === -1) {
        return publicIdWithExtension;
      }
      return publicIdWithExtension.substring(0, lastDotIndex);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async deleteFile(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }
}

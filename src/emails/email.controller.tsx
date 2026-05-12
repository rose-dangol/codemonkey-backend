import React from 'react';
import { Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { Resend } from 'resend';
import Welcome from './Welcome';

const resend = new Resend(process.env.RESEND_API_KEY);

@Controller('emails')
export class EmailController {
  @Post()
  async sendEmail() {
    try {
      const data = await resend.emails.send({
        from: 'rose.dangol23@gmail.com',
        to: 'rosyyy5ja@gmail.com',
        subject: 'hello!!',
        react: <Welcome />,
      });
      return { success: true, data };
    } catch (err) {
      throw new HttpException(
        { error: 'Failed to send email', details: err },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EmailService {
  constructor(private http: HttpClient) {} // inject HttpClient here

  sendEmail(email: string, subject: string, message: string) {
    const payload = { email, subject, message };
    this.http.post('http://localhost:3000/send-email', payload).subscribe(
      response => console.log('Email sent successfully:', response),
      error => console.error('Error sending email:', error)
    );
  }
  
}
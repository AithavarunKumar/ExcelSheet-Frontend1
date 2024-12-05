import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmailService } from './email.service';  // Keep this import as is
import { HttpClientModule } from '@angular/common/http';  // Import HttpClientModule
interface Record {
  ClientImage: string;
  ClientRole: string;
  ClientName: string;
  Category: string;
  // Add any other fields present in the record
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [FormsModule, CommonModule, HttpClientModule],  // No need for HttpClientModule here
})

export class AppComponent implements OnInit {
  email: string = '';
  data: any[] = [];
  fetchedData: any[] = [];
  loading: boolean = false;
 

  constructor(private http: HttpClient, private emailService: EmailService) { }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        this.data = []; // Reset data array
  
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  
          sheetData.forEach((row: any) => {
            const Category = row["Category"];
            const ClientNames = row["ClientName"];
            const ClientRole = row["ClientRole"];
            const ClientImage = row["ClientImage"];
  
            // Split client names by newline or comma
            const individualClientNames = ClientNames
              ? ClientNames.split(/[\n,]/).map((name: string) => name.trim()).filter(Boolean)
              : [];
  
            // Push individual entries into the data array
            individualClientNames.forEach((name: string) => { // Add type annotation for `name`
              this.data.push({
                Category,
                ClientName: name,
                ClientRole,
                ClientImage,
              });
            });
          });
        });
  
        console.log('Processed Excel data:', this.data);
  
       
      };
      reader.readAsBinaryString(file);
    }
  }
  sendDataToBackend() {
    console.log(this.data);

    if (Array.isArray(this.data) && this.data.length && this.email) {
      // Filter the data directly
      const validData = this.data.filter((record: Record) =>{
        return record.ClientImage && record.ClientRole && record.ClientName && record.Category
    });
  
      // Log the valid data
      console.log('Valid Data:', validData);
  
      if (validData.length) {
        this.loading = true;
        this.http.post('http://localhost:3000/upload', { file: JSON.stringify(validData) })
          .subscribe(
            (response: any) => {
              console.log('Data sent to backend:', response);
              this.fetchDataFromBackend();
            },
            (error) => {
              console.error('Error sending data:', error);
              this.loading = false;
            }
          );
      } else {
        console.error('No valid records to send');
        this.loading = false;
      }
    }
  }
  



  fetchDataFromBackend() {
    this.http.get<any[]>('http://localhost:3000/api/records')
      .subscribe(
        (response) => {
          this.fetchedData = response;
          this.sendEmail();
          this.loading = false;
        },
        (error) => {
          console.error('Error fetching data:', error);
          this.loading = false;
        }
      );
  }



  sendEmail() {
    if (this.email && this.fetchedData.length) {
      // Log the raw fetched data to verify category values
      console.log('Fetched Data:', this.fetchedData);

      // Normalize the category values by trimming and logging them for debugging
      this.fetchedData.forEach((record: Record) => {
        console.log('Category:', `"${record.Category}"`);  // Logs the raw Category value
      });

      // Filter for categories (trim and convert to lowercase for accurate matching)
      const promotions = this.fetchedData.filter((record: Record) =>
        record.Category && record.Category.trim().toLowerCase() === 'promotions'
      );
      const awards = this.fetchedData.filter((record: Record) =>
        record.Category && record.Category.trim().toLowerCase() === 'awards'
      );
      // Filter for "ENGX Events"
      const engxEvents = this.fetchedData.filter((record) =>
        record.Category && record.Category.trim().toLowerCase() === 'engx events'
      );

      // Filter for "Fun events"
      const funEvents = this.fetchedData.filter((record) =>
        record.Category && record.Category.trim().toLowerCase() === 'fun events'
      );

      // Logging the results to verify
      console.log('ENGX Events:', engxEvents);
      console.log('Fun Events:', funEvents);

      const certifications = this.fetchedData.filter((record: Record) =>
        record.Category && record.Category.trim().toLowerCase() === 'certifications'
      );
      const appreciations = this.fetchedData.filter((record: Record) =>
        record.Category && record.Category.trim().toLowerCase() === 'appreciations'
      );

      // Log the filtered categories for debugging
      console.log('Filtered Promotions:', promotions);
      console.log('Filtered Awards:', awards);

      const htmlContent = `
      <h3 style="text-align: center; margin-bottom: 20px;">Data from Excel:</h3>
      <h6>I am excited to present our Q3 2024 Open Banking & Payment and UKFS India newsletter...</h6>
      <br><br>
  
      <h6>Special highlights: 
      Gajanan has expertise in UI. When the team was struggling with UI functionality...</h6>
      
      <!-- Promotions Section -->
      <div class="section" style="margin-bottom: 30px;">
        <h4 style="font-size: 1.5em; margin-bottom: 10px; text-align: center; color: #2c3e50;">promotions</h4>
      <div class="group awards" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: flex-start; margin-top: 20px;">
  ${promotions.length > 0 ? 
    promotions.map((record, index) => `
      <div style="flex: 0 0 calc(20% - 20px);">
        <img src="${record.ClientImage}" style="border-radius: 100%" width="80" alt="${record.ClientName}">
        <div class="info">
          <h5>${record.ClientName}</h5>
          <p>${record.ClientRole}</p>
        </div>
      </div>
    `).join('') : 
    '<p style="text-align: center; font-size: 1.2em; color: #e74c3c; font-style: italic;">No awards available.</p>'
  }
</div>

      </div>
  
      <!-- Awards Section -->
      <div class="section" style="margin-bottom: 30px;">
        <h4 style="font-size: 1.5em; margin-bottom: 10px; text-align: center; color: #2c3e50;">Awards</h4>
        <div class="group awards" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: flex-start; margin-top: 20px;">
          ${awards.length > 0 ?
          awards.map((record) =>`
            <div>
              <img src="${record.ClientImage}"style="border-radius:100%" width="80" alt="${record.ClientName}">
              <div class="info">
                <h5>${record.ClientName}</h5>
                <p>${record.ClientRole}</p>
              </div>
            </div>
          `).join('') :
          '<p style="text-align: center; font-size: 1.2em; color: #e74c3c; font-style: italic;">No awards available.</p>'
        }
        </div><br><br>
  
      <!-- EngX Events Section -->
      <div class="section" style="margin-bottom: 30px;">
        <h4 style="font-size: 1.5em; margin-bottom: 10px; text-align: center; color: #2c3e50;">ENGX Events</h4>
        <div class="group engxevents" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: flex-start; margin-top: 20px;">
          ${engxEvents.length > 0 ?
            engxEvents.map((record) => `
            <div>
              <img src="${record.ClientImage}"style="border-radius:100%" width="80" alt="${record.ClientName}">
              <div class="info">
                <h5>${record.ClientName}</h5>
                <p>${record.ClientRole}</p>
              </div>
            </div>
          `).join('') :
          '<p style="text-align: center; font-size: 1.2em; color: #e74c3c; font-style: italic;">No ENGX events available.</p>'
        }
        </div><br><br>
  
      <!-- Fun Events Section -->
      <div class="section" style="margin-bottom: 30px;">
        <h4 style="font-size: 1.5em; margin-bottom: 10px; text-align: center; color: #2c3e50;">Fun Events</h4>
        <div class="group funevents" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: flex-start; margin-top: 20px;">
          ${funEvents.length > 0 ?
            funEvents.map((record) => `
            <div>
              <img src="${record.ClientImage}"style="border-radius:100%" width="80" alt="${record.ClientName}">
              <div class="info">
                <h5>${record.ClientName}</h5>
                <p>${record.ClientRole}</p>
              </div>
            </div>
          `).join('') :
          '<p style="text-align: center; font-size: 1.2em; color: #e74c3c; font-style: italic;">No fun events available.</p>'
        }
        </div><br><br>
  
      <!-- Certifications Section -->
      <div class="section" style="margin-bottom: 30px;">
        <h4 style="font-size: 1.5em; margin-bottom: 10px; text-align: center; color: #2c3e50;">Certifications</h4>
        <div class="group certifications" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: flex-start; margin-top: 20px;">
          ${certifications.length > 0 ?
          certifications.map((record) => `
            <div>
              <img src="${record.ClientImage}"style="border-radius:100%" width="80" alt="${record.ClientName}">
              <div class="info">
                <h5>${record.ClientName}</h5>
                <p>${record.ClientRole}</p>
              </div>
            </div>
          `).join('') :
          '<p style="text-align: center; font-size: 1.2em; color: #e74c3c; font-style: italic;">No certifications available.</p>'
        }
        </div><br><br>
  
      <!-- Appreciations Section -->
      <div class="section" style="margin-bottom: 30px;">
        <h4 style="font-size: 1.5em; margin-bottom: 10px; text-align: center; color: #2c3e50;">Appreciations</h4>
        <div class="group appreciations" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: flex-start; margin-top: 20px;">
          ${appreciations.length > 0 ?
          appreciations.map((record) => `
            <div>
              <img src="${record.ClientImage}"style="border-radius:100%" width="80" alt="${record.ClientName}">
              <div class="info">
                <h5>${record.ClientName}</h5>
                <p>${record.ClientRole}</p>
              </div>
            </div>
          `).join('') :
          '<p style="text-align: center; font-size: 1.2em; color: #e74c3c; font-style: italic;">No appreciations available.</p>'
        }
        </div><br><br>
      </div>
    `;

      // Sending the email with updated HTML content
      this.emailService.sendEmail(this.email, 'Fetched Data', htmlContent);
    } else {
      console.log('Email or fetched data is missing.');
    }
  }






  ngOnInit(): void { }
}

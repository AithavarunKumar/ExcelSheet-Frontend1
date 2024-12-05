import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { importProvidersFrom } from '@angular/core'; // Required for importing providers from modules

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule) // Correct way to import provider modules
  ]
}).catch(err => console.error(err));
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

interface Response {
  available: boolean;
}

@Component({
  selector: 'app-availability-checker',
  templateUrl: './availability-checker.component.html',
  styleUrls: ['./availability-checker.component.css'],
})
export class AvailabilityCheckerComponent implements OnInit {
  availableTimes: string[] = [];
  responseMessage!: string;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  form!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
    this.generateAvailableTimes();
  }

  generateAvailableTimes() {
    let times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
        const minuteStr = minute === 0 ? '00' : `${minute}`;
        times.push(`${hourStr}:${minuteStr}`);
      }
    }
    this.availableTimes = times;
  }

  initializeForm() {
    this.form = new FormGroup({
      date: new FormControl('', Validators.required),
      time: new FormControl('', Validators.required),
    });
  }

  onSubmitForm() {
    if (this.form.valid) {
      console.log(this.form.value);

      const dateInput = this.form.get('date')?.value;
      const timeInput = this.form.get('time')?.value;

      const [hour, minute] = timeInput.split(':');

      const formattedDate = new Date(dateInput);
      formattedDate.setHours(hour, minute);

      const isoDateString = formattedDate.toISOString();

      const url = `http://localhost:8080/resource/1337/available?datetime=${isoDateString}`;

      this.http.get<Response>(url).subscribe({
        next: (response) => {
          console.log('the response', response);

          this.responseMessage = response.available
            ? `The resource is available on ${isoDateString}'`
            : "The resource isn't available";

          this.snackBar.open(this.responseMessage, 'Close', {
            duration: 5000,
          });
        },
        error: (error) => {
          console.error('response error', error);
        },
      });
    } else {
      console.log('Form is invalid');
    }
  }
}

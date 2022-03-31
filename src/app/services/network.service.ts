import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  constructor(private httpClient: HttpClient) {

  }

  post<T>(method: string, body: any): Observable<T> {
    return this.httpClient.post<T>(environment.apiEndpoint + method, body);
  }

  get<T>(method: string): Observable<T> {
    return this.httpClient.get<T>(environment.apiEndpoint + method);
  }

  put<T>(method: string, body: T): Observable<T> {
    return this.httpClient.put<T>(environment.apiEndpoint + method, body);
  }

}

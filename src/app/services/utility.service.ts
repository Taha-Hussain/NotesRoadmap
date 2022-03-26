import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UtilityService {

    constructor() { }

    addDays(date: Date, days: number) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    workingDaysDifference(startDate: Date, endDate: Date) {
        let count = 0;
        let curDate = +startDate;
        while (curDate <= +endDate) {
            const dayOfWeek = new Date(curDate).getDay();
            const isWeekend = (dayOfWeek === 6) || (dayOfWeek === 0);
            if (!isWeekend) {
                count++;
            }
            curDate = curDate + 24 * 60 * 60 * 1000
        }
        return count;
    }

    daysDifference(startDate: Date, endDate: Date) {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / oneDay)) + 1;
    }

    calculateDays(startDay: number, daysCount: number) {
        var days = [];
        for (var i = 0; i < daysCount; i++) {
            if (i < 6) {
                days.push(startDay++);
            }
        }
        return days;
    }

    getMaxItemCount(arr: number[]) {
        arr = arr.filter(x => x != undefined);
        var n = arr.length;
        //using moore's voting algorithm
        var res = 0;
        var count = 1;
        for (var i = 1; i < n; i++) {
            if (arr[i] === arr[res]) {
                count++;
            } else {
                count--;
            }

            if (count === 0) {
                res = i;
                count = 1;
            }
        }

        var count = 0;
        for (var i = 0; i < n; i++) {
            if (arr[res] && arr[i] === arr[res]) {
                count++;
            }
        }
        return count;
    }
}

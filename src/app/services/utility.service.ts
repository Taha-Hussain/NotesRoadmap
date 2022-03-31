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

    addBusinessDaysToDate(date: Date, days: number) {
        date = new Date(date);
        var day = date.getDay();
        date = new Date(date.getTime());
        date.setDate(date.getDate() + days + (day === 6 ? 2 : +!day) + (Math.floor((days - 1 + (day % 6 || 1)) / 5) * 2));
        return date;
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
        var obj = arr.reduce((acc: any, value: any) => ({
            ...acc,
            [value]: (acc[value] || 0) + 1
        }), {});

        console.log(obj);
        let values:number[] = Object.values(obj);                
        return Math.max(...values);
    }
}

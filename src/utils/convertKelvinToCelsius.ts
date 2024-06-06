/** @format */

export function convertKelvinToCelsius(tempKelvin: number): number{
    const tempInCelsius = tempKelvin - 273.15;
    return Math.floor(tempInCelsius); // removes decimal part and keeps integer part
}
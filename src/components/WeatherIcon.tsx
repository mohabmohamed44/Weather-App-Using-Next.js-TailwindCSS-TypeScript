/** @format */

import React from "react";
import Image from "next/image";
import { cn } from "@/utils/cn";

type Props = React.HTMLProps<HTMLDivElement> & {
  iconName: string;
  isWeatherApi?: boolean;
};

export default function WeatherIcon({
  iconName,
  isWeatherApi = true,
  ...rest
}: Props) {
  const iconUrl = isWeatherApi
    ? `https://cdn.weatherapi.com/weather/64x64/day/${iconName}.png`
    : `https://openweathermap.org/img/wn/${iconName}@4x.png`;

  return (
    <div {...rest} className={cn("relative h-20 w-20")}>
      <Image
        width={100}
        height={100}
        alt="weather-icon"
        className="absolute h-full w-full"
        src={iconUrl}
      />
    </div>
  );
}

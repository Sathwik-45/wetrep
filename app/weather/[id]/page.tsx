// app/weather/[id]/page.tsx

import WeatherClient from "./WeatherClient";

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return <WeatherClient id={params.id} />;
}

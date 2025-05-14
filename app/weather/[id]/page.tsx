import WeatherClient from "./WeatherClient";

export default function Page({ params }: { params: { id: string } }) {
  return <WeatherClient cityId={params.id} />;
}

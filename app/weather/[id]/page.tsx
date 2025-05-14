import WeatherClient from "./WeatherClient";

type PageProps = {
  params: {
    id: string;
  };
};

export default function Page({ params }: PageProps) {
  return <WeatherClient cityId={params.id} />;
}

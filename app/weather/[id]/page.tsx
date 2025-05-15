import dynamic from "next/dynamic";

const WeatherClient = dynamic(() => import("@/components/WeatherClient"), {
  ssr: false,
});

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <main className="min-h-screen p-4 bg-light">
      <div className="container">
        <h1 className="text-center my-4 text-primary">Weather Forecast</h1>
        <WeatherClient cityId={id} />
      </div>
    </main>
  );
}

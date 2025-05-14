import CitiesTable from "./components/citiestable";

export default function Home() {
  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">City Weather Explorer</h1>
      <CitiesTable />
    </div>
  );
}

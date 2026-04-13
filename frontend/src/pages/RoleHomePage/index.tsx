import { Header } from "../../components/general/Header";

type RoleHomePageProps = {
  title: string;
  description: string;
};

export function RoleHomePage({ title, description }: RoleHomePageProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col gap-10 pb-20">
      <Header />

      <main className="max-w-4xl mx-auto w-full px-6">
        <h1 className="text-3xl font-bold text-vinculo-dark">{title}</h1>
        <p className="mt-4 text-slate-700">{description}</p>
      </main>
    </div>
  );
}

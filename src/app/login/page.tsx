export default function LoginPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Login</h1>
      <form className="mt-6 flex flex-col gap-3 max-w-sm">
        <input className="border p-2" placeholder="Email" />
        <input className="border p-2" placeholder="Password" type="password" />
        <button className="bg-black text-white p-2">Login</button>
      </form>
    </main>
  )
}
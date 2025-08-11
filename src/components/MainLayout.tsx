import Navbar from "./Navbar";

interface MainLayoutProps{
    children:React.ReactNode
}

export default function MainLayout({children}:MainLayoutProps){
    return(
       <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="text-white">
        {children}
      </main>
    </div> 
    )
}
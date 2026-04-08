import { PageTransition } from '../components/layout/PageTransition'

export function GalleryPage() {
  return (
    <PageTransition>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extralight tracking-widest">
          GAL<span className="font-bold">LERY</span>
        </h1>
      </div>
    </PageTransition>
  )
}

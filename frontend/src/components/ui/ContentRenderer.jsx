import { ExternalLink } from 'lucide-react'

export default function ContentRenderer({ content }) {
  if (!content) return null

  return (
    <article className="prose prose-slate max-w-none">
      <div className="whitespace-pre-wrap font-medium text-slate-600 leading-relaxed">
        {content}
      </div>
    </article>
  )
}

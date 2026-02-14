// components/feed/FeedCard.tsx
import Link from "next/link"
import type { FeedItem } from "@/types/feed"
import { LikeButton } from "@/components/works/LikeButton"

interface FeedCardProps {
  item: FeedItem
}

export function FeedCard({ item }: FeedCardProps) {
  const thumbnail = item.images?.[0]?.url ?? null

  return (
    <Link href={`/dashboard/work/${item.id}`} className="block">
      <article className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200">
      {/* Image */}
      <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Author */}
        <div className="flex items-center gap-2">
          {item.author_avatar_url ? (
            <img
              src={item.author_avatar_url}
              alt=""
              className="w-6 h-6 rounded-full object-cover ring-1 ring-gray-200"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-500">
                {item.author_full_name?.charAt(0) ?? "?"}
              </span>
            </div>
          )}
          <span className="text-[15px] font-bold text-gray-900 truncate">
            {item.author_full_name}
          </span>
        </div>

        {/* Title */}
        <div className="mt-1">
          <h3 className="text-[13px] text-gray-500 leading-snug line-clamp-2">
            {item.title}
          </h3>
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <LikeButton workId={item.id} initialCount={item.likes_count} size="sm" />
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            {item.comments_count}
          </span>
          {item.views_count > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              {item.views_count}
            </span>
          )}
        </div>
      </div>
    </article>
    </Link>
  )
}

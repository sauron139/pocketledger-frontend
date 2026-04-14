import { useEffect } from 'react'
export function usePageTitle(title) {
  useEffect(() => {
    document.title = `PocketLedger — ${title}`
    return () => { document.title = 'PocketLedger' }
  }, [title])
}

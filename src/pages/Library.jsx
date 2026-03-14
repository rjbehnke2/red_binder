export default function Library() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-100">Personal Library</h2>
        <p className="text-sm text-gray-500 mt-1">Books, courses, and sources you've learned from.</p>
      </div>

      <div className="card text-center py-12 border-dashed">
        <p className="text-3xl mb-3">📚</p>
        <p className="text-gray-400 font-medium">Library coming in Week 3</p>
        <p className="text-gray-600 text-sm mt-1">
          Track books and sources linked to your entries.
        </p>
      </div>
    </div>
  )
}

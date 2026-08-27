export default function ItemsTable({ title, items }) {
    return (
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">{title}:</h3>
        <div className="bg-white bg-opacity-70 rounded-lg p-2">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1">Material</th>
                <th className="text-left py-1">Pieces</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-1">{item.materialCode}</td>
                  <td className="py-1">{item.pieces}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  
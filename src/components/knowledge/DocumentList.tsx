'use client';

interface Document {
  id: string;
  title: string;
  originalFileName: string;
  docType: string;
  source: string;
  status: string;
  createdAt: Date;
  _count: {
    chunks: number;
  };
}

interface DocumentListProps {
  documents: Document[];
}

export default function DocumentList({ documents }: DocumentListProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      EMBEDDED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      PARSED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      UPLOADED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };
    return styles[status as keyof typeof styles] || styles.UPLOADED;
  };

  const getDocTypeColor = (type: string) => {
    const colors = {
      POLICY: 'text-blue-600',
      INCIDENT: 'text-red-600',
      ARCHITECTURE: 'text-purple-600',
      CHAT: 'text-green-600',
      TABLE: 'text-yellow-600',
      OTHER: 'text-gray-600',
    };
    return colors[type as keyof typeof colors] || colors.OTHER;
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Documents</h2>
      
      {documents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📄</div>
          <p>No documents yet</p>
          <p className="text-sm mt-2">Configure a Sense client to start ingesting documents</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chunks
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-4">
                    <div className="font-medium">{doc.title}</div>
                    <div className="text-sm text-gray-500">{doc.originalFileName}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm font-medium ${getDocTypeColor(doc.docType)}`}>
                      {doc.docType}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {doc._count.chunks}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {doc.source}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

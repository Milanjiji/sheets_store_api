import { useState } from 'react';
import {
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'sheetstore';

export default function SheetStorePage() {
  const [sheetId, setSheetId] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [docId, setDocId] = useState('');
  const [data, setData] = useState('{}');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRunner = async (fn: string) => {
    try {
      setIsLoading(true);
      setResponse('Loading...');
      
      let res: unknown;
      const parsedData = JSON.parse(data || '{}');
      if (fn === 'getDocs') res = await getDocs(sheetId, sheetName);
      else if (fn === 'getDoc') res = await getDoc(sheetId, sheetName, docId);
      else if (fn === 'addDoc') res = await addDoc(sheetId, sheetName, parsedData);
      else if (fn === 'updateDoc') res = await updateDoc(sheetId, sheetName, docId, parsedData);
      else if (fn === 'deleteDoc') res = await deleteDoc(sheetId, sheetName, docId);

      setResponse(JSON.stringify(res, null, 2));
    } catch (err: unknown) {
      setResponse(`Error: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-black min-h-screen text-white">
      <h1 className="mt-[50px] text-5xl font-semibold mb-6 text-left text-white">SheetStore</h1>

      <section className="bg-black p-6 rounded-xl border border-gray-700 mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">🧾 Documentation</h2>
        <p className="mb-2">Import SheetStore:</p>
        <pre className="bg-gray-800 p-2 rounded text-sm overflow-x-auto">
          <code className="text-green-400">
            {`import { getDocs, getDoc, addDoc, updateDoc, deleteDoc } from 'sheetstore';`}
          </code>
        </pre>

        <div className="mt-4 space-y-4">
          <FunctionDoc
            title="Fetching All Documents"
            code={`const users = await getDocs(sheetId, sheetName);`}
          />
          <FunctionDoc
            title="Fetching a Single Document"
            code={`const user = await getDoc(sheetId, sheetName, userId);`}
          />
          <FunctionDoc
            title="Adding a New Document"
            code={`await addDoc(sheetId, sheetName, { name: 'John' });`}
          />
          <FunctionDoc
            title="Updating a Document"
            code={`await updateDoc(sheetId, sheetName, userId, { age: 31 });`}
          />
          <FunctionDoc
            title="Deleting a Document"
            code={`await deleteDoc(sheetId, sheetName, userId);`}
          />
        </div>
      </section>

      <section className="bg-black p-6 rounded-xl border border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 text-white">🧪 Live Runner</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Sheet ID" value={sheetId} onChange={setSheetId} />
          <Input label="Sheet Name" value={sheetName} onChange={setSheetName} />
          <Input label="Document ID (for get/update/delete)" value={docId} onChange={setDocId} />
          <div>
            <label className="block font-medium mb-1 text-gray-300">Document Data (JSON)</label>
            <textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded text-sm text-white focus:outline-none"
              rows={4}
              placeholder={`{ "name": "John", "email": "john@example.com" }`}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {['getDocs', 'getDoc', 'addDoc', 'updateDoc', 'deleteDoc'].map((fn) => (
            <button
              key={fn}
              onClick={() => handleRunner(fn)}
              className="bg-black border border-gray-700 text-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
            >
              Run {fn}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <label className="block font-medium mb-1 text-gray-300">📤 Response Output:</label>
          <pre className="bg-gray-800 p-3 rounded text-sm max-h-60 overflow-auto">
            <code className="text-green-400">
              {isLoading ? '...' : response}
            </code>
          </pre>
        </div>
      </section>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string, value: string, onChange: (value: string) => void }) {
  return (
    <div>
      <label className="block font-medium mb-1 text-gray-300">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 p-2 rounded text-white focus:outline-none"
      />
    </div>
  );
}

function FunctionDoc({ title, code }: { title: string, code: string }) {
  return (
    <div>
      <p className="font-semibold text-gray-300">{title}</p>
      <pre className="bg-gray-800 p-2 rounded text-sm overflow-x-auto">
        <code className="text-green-400">{code}</code>
      </pre>
    </div>
  );
}

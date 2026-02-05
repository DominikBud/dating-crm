import ContactForm from "@/components/ContactForm";

export default function NewContactPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Add New Girl</h1>
        <p className="text-gray-500 mt-1">
          Add someone new to your pipeline
        </p>
      </div>

      <div className="card">
        <ContactForm />
      </div>
    </div>
  );
}

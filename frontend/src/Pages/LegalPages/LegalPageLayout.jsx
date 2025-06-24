// src/components/LegalPageLayout.jsx

import Footer from "../../Components/Common/Footer";

function LegalPageLayout({ title, icon: Icon, children }) {
  return (
    <>
      <div className="min-h-screen bg-background text-textMain px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            {Icon && <Icon className="text-primary w-6 h-6" />}
            <h1 className="text-3xl font-bold text-primary">{title}</h1>
          </div>
          <div className="space-y-6 text-muted">{children}</div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default LegalPageLayout;

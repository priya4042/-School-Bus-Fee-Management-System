import { supabase } from '../lib/supabase';

export type DocType = 'vaccine' | 'medical' | 'id_proof' | 'birth_certificate' | 'photo' | 'other';

export const DOC_TYPE_OPTIONS: Array<{ key: DocType; label: string; icon: string; color: string }> = [
  { key: 'vaccine',           label: 'Vaccine Card',      icon: 'fa-syringe',         color: 'bg-emerald-50 text-emerald-700' },
  { key: 'medical',           label: 'Medical Certificate', icon: 'fa-stethoscope',  color: 'bg-blue-50 text-blue-700' },
  { key: 'id_proof',          label: 'ID Proof',          icon: 'fa-id-card',         color: 'bg-purple-50 text-purple-700' },
  { key: 'birth_certificate', label: 'Birth Certificate', icon: 'fa-certificate',     color: 'bg-amber-50 text-amber-700' },
  { key: 'photo',             label: 'Photo',             icon: 'fa-image',           color: 'bg-rose-50 text-rose-700' },
  { key: 'other',             label: 'Other',             icon: 'fa-file',            color: 'bg-slate-50 text-slate-700' },
];

export interface StudentDocumentRow {
  id: string;
  student_id: string;
  doc_type: DocType;
  doc_url: string;
  doc_name: string | null;
  uploaded_by: string | null;
  created_at: string;
}

const SUPPORTED_MIME = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

export interface UploadDocumentInput {
  studentId: string;
  docType: DocType;
  file: File;
  uploadedBy: string;
}

export interface UploadDocumentResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/** Upload a document file to the receipts bucket and record metadata. */
export const uploadStudentDocument = async (input: UploadDocumentInput): Promise<UploadDocumentResult> => {
  try {
    if (!input.file) return { ok: false, error: 'No file provided' };
    if (input.file.size > 10 * 1024 * 1024) return { ok: false, error: 'File must be ≤ 10MB' };
    if (!SUPPORTED_MIME.includes(input.file.type)) {
      return { ok: false, error: 'Only PNG, JPG, or PDF files are allowed' };
    }

    const ext = (input.file.name.split('.').pop() || 'bin').toLowerCase();
    const filename = `student-docs/${input.studentId}/${input.docType}-${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('receipts')
      .upload(filename, input.file, { cacheControl: '3600', upsert: false });

    if (uploadErr) return { ok: false, error: uploadErr.message };

    const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(filename);
    const docUrl = urlData?.publicUrl || '';

    const { data, error: insertErr } = await supabase
      .from('student_documents')
      .insert({
        student_id: input.studentId,
        doc_type: input.docType,
        doc_url: docUrl,
        doc_name: input.file.name,
        uploaded_by: input.uploadedBy,
      })
      .select('id')
      .single();

    if (insertErr) return { ok: false, error: insertErr.message };
    return { ok: true, id: data?.id };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Upload failed' };
  }
};

export const fetchStudentDocuments = async (studentId: string): Promise<StudentDocumentRow[]> => {
  const { data, error } = await supabase
    .from('student_documents')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('fetchStudentDocuments failed:', error);
    return [];
  }
  return data || [];
};

export const deleteStudentDocument = async (id: string) => {
  const { error } = await supabase.from('student_documents').delete().eq('id', id);
  return { ok: !error, error: error?.message };
};

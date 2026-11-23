
import { useState } from 'react';

interface CreateProjectFormProps {
    onSubmit: (name: string, description: string) => Promise<void>;
    onClose: () => void;
}

function CreateProjectForm({ onSubmit, onClose }: CreateProjectFormProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [createError, setCreateError] = useState('');
    const [creating, setCreating] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCreateError('');

        if (!name.trim()) return;

        try {
            setCreating(true);

            await onSubmit(name, description);

            setName('');
            setDescription('');

        } catch (error) {
            console.log(error);
            setCreateError(
                'Failed to create project. Please try again.'
            );
        } finally {
            setCreating(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md p-4"
            onClick={onClose}
        >
            <div
                className="w-full  max-w-xl min-h-105 rounded-2xl bg-white p-10 shadow-2xl dark:bg-gray-900"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="title pb-4">Create Project</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="field">    Project Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Enter project name"
                            required
                            className="auth-input" />
                    </div>

                    <div>
                        <label className="field">
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe your project"
                            rows={3}
                            className="auth-input" />
                    </div>

                    {createError && (
                        <p className="error">
                            {createError}
                        </p>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={creating}
                            className="main_btn"    >
                            <span className={creating ? 'invisible' : ''}>Create Project</span>
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="sub_btn"  >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div >
    );
}

export default CreateProjectForm;

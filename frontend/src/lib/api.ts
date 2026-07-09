import { SSEStartedEvent, SSEBatchCompleteEvent, SSEDoneEvent, SSEErrorEvent } from '../types';

export function streamImport(
    file: File, 
    callbacks: {
        onStarted: (data: SSEStartedEvent) => void;
        onBatchComplete: (data: SSEBatchCompleteEvent) => void;
        onDone: (data: SSEDoneEvent) => void;
        onError: (data: SSEErrorEvent) => void;
    }
): { abort: () => void } {
    let evtSource: EventSource | null = null;
    let aborted = false;
    
    const runStream = async () => {
        try {
            // STEP 1: Upload the file via POST and get a Job ID
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch('http://localhost:3001/api/v1/import/upload', {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) {
                let errorMsg = 'Failed to upload CSV.';
                try {
                    const errJson = await uploadRes.json();
                    if (errJson.error) errorMsg = errJson.error;
                } catch (e) {}
                throw new Error(errorMsg);
            }

            const { jobId } = await uploadRes.json();

            if (aborted) return;

            // STEP 2: Connect to the native EventSource GET stream
            // EventSource natively bypasses antivirus and browser POST buffering perfectly!
            evtSource = new EventSource(`http://localhost:3001/api/v1/import/stream/${jobId}`);

            evtSource.addEventListener('started', (e: MessageEvent) => {
                callbacks.onStarted(JSON.parse(e.data));
            });

            evtSource.addEventListener('batch_complete', (e: MessageEvent) => {
                callbacks.onBatchComplete(JSON.parse(e.data));
            });

            evtSource.addEventListener('done', (e: MessageEvent) => {
                callbacks.onDone(JSON.parse(e.data));
                if (evtSource) {
                    evtSource.close();
                }
            });

            evtSource.addEventListener('error', (e: MessageEvent) => {
                // EventSource error event doesn't usually have a data payload unless explicitly sent
                if (e.data) {
                    try {
                        const errData = JSON.parse(e.data);
                        callbacks.onError({ message: errData.message });
                    } catch {
                        callbacks.onError({ message: 'Server streaming error.' });
                    }
                } else {
                    callbacks.onError({ message: 'Connection to server lost.' });
                }
                if (evtSource) {
                    evtSource.close();
                }
            });

        } catch (err: any) {
            if (!aborted) {
                callbacks.onError({ message: err.message || 'Connection lost or server error.' });
            }
        }
    };

    runStream();

    return {
        abort: () => {
            aborted = true;
            if (evtSource) {
                evtSource.close();
                console.log('EventSource aborted by user.');
            }
        }
    };
}

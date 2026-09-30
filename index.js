const express = require('express');
const app = express();
app.use(express.json());

const taskQueue = [];
const deadLetterQueue = [];

app.post('/api/v1/webhooks/ingest', (req, res) => {
    const { event, payload, targetUrl } = req.body;
    
    if (!event || !targetUrl) {
        return res.status(400).json({ error: "Missing event or targetUrl" });
    }

    const task = {
        id: `evt_${Date.now()}`,
        event,
        payload,
        targetUrl,
        attempts: 0,
        maxRetries: 3,
        createdAt: new Date()
    };

    taskQueue.push(task);
    res.status(202).json({ message: "Webhook queued successfully", taskId: task.id });
});

app.get('/api/v1/queue/status', (req, res) => {
    res.json({
        pendingTasks: taskQueue.length,
        failedTasksInDLQ: deadLetterQueue.length,
        queue: taskQueue
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook engine running on port ${PORT}`);
});

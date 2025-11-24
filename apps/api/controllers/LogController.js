import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get courier integration logs
 * GET /api/admin/courier-integration/logs
 * @query {string} type - Log type: 'combined' | 'error' (default: 'combined')
 * @query {number} lines - Number of lines to return (default: 100, max: 1000)
 * @query {string} filter - Filter logs by keyword (optional)
 */
export const getCourierLogs = async (req, res) => {
    try {
        const { type = 'combined', lines = 100, filter } = req.query;
        const maxLines = Math.min(parseInt(lines) || 100, 1000);

        // Determine log file path
        const logFile = type === 'error' ? 'error.log' : 'combined.log';
        const logPath = path.join(__dirname, '..', 'logs', logFile);

        // Check if log file exists
        try {
            await fs.access(logPath);
        } catch {
            return res.json({
                success: true,
                logs: [],
                message: `No ${type} logs found yet`,
                file: logFile
            });
        }

        // Read log file
        const logContent = await fs.readFile(logPath, 'utf-8');
        const allLines = logContent.split('\n').filter(line => line.trim());

        // Filter logs if keyword provided
        let filteredLines = allLines;
        if (filter) {
            const filterLower = filter.toLowerCase();
            filteredLines = allLines.filter(line =>
                line.toLowerCase().includes(filterLower) ||
                line.toLowerCase().includes('courier') ||
                line.toLowerCase().includes('muditakurye')
            );
        }

        // Get last N lines
        const recentLines = filteredLines.slice(-maxLines).reverse();

        // Parse JSON logs
        const parsedLogs = recentLines.map((line, index) => {
            try {
                const parsed = JSON.parse(line);
                return {
                    id: `log-${Date.now()}-${index}`,
                    timestamp: parsed.timestamp,
                    level: parsed.level,
                    message: parsed.message,
                    service: parsed.service,
                    ...parsed
                };
            } catch {
                // If not JSON, return as plain text
                return {
                    id: `log-${Date.now()}-${index}`,
                    timestamp: new Date().toISOString(),
                    level: 'info',
                    message: line,
                    raw: true
                };
            }
        });

        res.json({
            success: true,
            logs: parsedLogs,
            total: parsedLogs.length,
            file: logFile,
            filtered: !!filter
        });

    } catch (error) {
        logger.error('Failed to get courier logs', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve logs',
            error: error.message
        });
    }
};

/**
 * Clear courier integration logs
 * DELETE /api/admin/courier-integration/logs
 * @query {string} type - Log type: 'combined' | 'error' | 'all' (default: 'all')
 */
export const clearCourierLogs = async (req, res) => {
    try {
        const { type = 'all' } = req.query;

        const filesToClear = [];
        if (type === 'all' || type === 'combined') {
            filesToClear.push('combined.log');
        }
        if (type === 'all' || type === 'error') {
            filesToClear.push('error.log');
        }

        for (const file of filesToClear) {
            const logPath = path.join(__dirname, '..', 'logs', file);
            try {
                await fs.writeFile(logPath, '');
                logger.info(`Cleared log file: ${file}`, {
                    clearedBy: 'admin',
                    file
                });
            } catch (error) {
                logger.warn(`Failed to clear log file: ${file}`, {
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Cleared ${filesToClear.join(', ')}`,
            filesCleared: filesToClear
        });

    } catch (error) {
        logger.error('Failed to clear courier logs', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to clear logs',
            error: error.message
        });
    }
};

/**
 * Stream logs in real-time (SSE - Server-Sent Events)
 * GET /api/admin/courier-integration/logs/stream
 */
export const streamCourierLogs = async (req, res) => {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const logPath = path.join(__dirname, '..', 'logs', 'combined.log');
    let lastSize = 0;

    try {
        // Get initial file size
        const stats = await fs.stat(logPath);
        lastSize = stats.size;
    } catch {
        // File doesn't exist yet
        lastSize = 0;
    }

    // Check for new content every 2 seconds
    const interval = setInterval(async () => {
        try {
            const stats = await fs.stat(logPath);
            if (stats.size > lastSize) {
                // Read only new content
                const stream = await fs.open(logPath, 'r');
                const buffer = Buffer.alloc(stats.size - lastSize);
                await stream.read(buffer, 0, stats.size - lastSize, lastSize);
                await stream.close();

                const newContent = buffer.toString('utf-8');
                const newLines = newContent.split('\n').filter(line => line.trim());

                // Send new logs to client
                for (const line of newLines) {
                    try {
                        const parsed = JSON.parse(line);
                        // Only send courier-related logs
                        if (line.toLowerCase().includes('courier') ||
                            line.toLowerCase().includes('muditakurye') ||
                            parsed.level === 'error') {
                            res.write(`data: ${JSON.stringify(parsed)}\n\n`);
                        }
                    } catch {
                        // Skip non-JSON lines
                    }
                }

                lastSize = stats.size;
            }
        } catch (error) {
            // Log file might not exist yet, ignore
        }
    }, 2000);

    // Clean up on client disconnect
    req.on('close', () => {
        clearInterval(interval);
        res.end();
    });
};

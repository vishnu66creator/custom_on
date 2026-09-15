import { spawn } from "child_process";
import http from "http";
import net from "net";

const CUSTOMER_PORT = 5173;
const ADMIN_PORT = 5174;

// Terminal colors
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const magenta = (text) => `\x1b[35m${text}\x1b[0m`;
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;
const dim = (text) => `\x1b[2m${text}\x1b[0m`;

function printBanner() {
  console.log("\n");
  console.log(cyan("┌──────────────────────────────────────────────────────────────┐"));
  console.log(cyan("│") + bold("  🚀 CUSTOM ON — Dual Port Dev Server Connected               ") + cyan("│"));
  console.log(cyan("├──────────────────────────────────────────────────────────────┤"));
  console.log(cyan("│") + `  🛒 ${bold("Customer Web Page:")}  ${green(`http://localhost:${CUSTOMER_PORT}/`)}           ` + cyan("│"));
  console.log(cyan("│") + `  🛡️  ${bold("Admin Web Page:")}     ${magenta(`http://localhost:${ADMIN_PORT}/admin/login`)}     ` + cyan("│"));
  console.log(cyan("├──────────────────────────────────────────────────────────────┤"));
  console.log(cyan("│") + dim("  Both links are connected together sharing DB, Auth & HMR.    ") + cyan("│"));
  console.log(cyan("└──────────────────────────────────────────────────────────────┘"));
  console.log("\n");
}

function startAdminProxy() {
  const server = http.createServer((req, res) => {
    // If accessing root "/" on port 5174, redirect to /admin/login
    if (req.url === "/" || req.url === "") {
      res.writeHead(302, { Location: "/admin/login" });
      res.end();
      return;
    }

    const options = {
      hostname: "127.0.0.1",
      port: CUSTOMER_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `localhost:${ADMIN_PORT}`,
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on("error", () => {
      if (!res.headersSent) {
        res.writeHead(502, { "Content-Type": "text/html" });
        res.end("<h3>Starting Custom On Dev Server... Please refresh in a moment.</h3>");
      }
    });

    req.pipe(proxyReq, { end: true });
  });

  server.on("upgrade", (req, socket, head) => {
    const proxySocket = net.connect(CUSTOMER_PORT, "127.0.0.1", () => {
      proxySocket.write(
        `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n` +
          Object.keys(req.headers)
            .map((key) => `${key}: ${req.headers[key]}`)
            .join("\r\n") +
          "\r\n\r\n"
      );
      if (head && head.length > 0) proxySocket.write(head);
      socket.pipe(proxySocket);
      proxySocket.pipe(socket);
    });

    proxySocket.on("error", () => socket.destroy());
    socket.on("error", () => proxySocket.destroy());
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`\x1b[33mWarning: Port ${ADMIN_PORT} is already in use.\x1b[0m`);
    } else {
      console.error(`Admin Proxy Server error:`, err);
    }
  });

  server.listen(ADMIN_PORT, "0.0.0.0");
  return server;
}

const adminServer = startAdminProxy();

const isWin = process.platform === "win32";
const spawnCmd = isWin ? "cmd.exe" : "npx";
const spawnArgs = isWin
  ? ["/c", "npx", "vite", "dev", "--port", String(CUSTOMER_PORT)]
  : ["vite", "dev", "--port", String(CUSTOMER_PORT)];

const viteProc = spawn(spawnCmd, spawnArgs, {
  stdio: "inherit",
  env: { ...process.env, VITE_PORT: String(CUSTOMER_PORT) },
});

setTimeout(() => {
  printBanner();
}, 2500);

function cleanup() {
  try {
    adminServer.close();
  } catch {}
  try {
    viteProc.kill();
  } catch {}
  process.exit();
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

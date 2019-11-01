import path from 'path';
import fs from 'fs';

// TODO: Switch to using "fs.readFile"
export default async function readCertificateFiles(
  rootPath: string,
  certificate: {
    keyPath: string;
    certPath: string;
    caPath: string;
  }
): Promise<{ key: Buffer; cert: Buffer; ca: Buffer }> {
  return {
    key: fs.readFileSync(path.resolve(rootPath, certificate.keyPath)),
    cert: fs.readFileSync(path.resolve(rootPath, certificate.certPath)),
    ca: fs.readFileSync(path.resolve(rootPath, certificate.caPath))
  };
}

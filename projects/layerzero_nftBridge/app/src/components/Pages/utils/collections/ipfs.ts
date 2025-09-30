export function validateIpfsCid(cid: string): boolean {
  const cidRegex = /^[a-zA-Z0-9]{46}$|^b[0-7a-zA-Z]{58}$/;
  return cidRegex.test(cid);
}

export function getIpfsUrl(cid: string, useCloudflare: boolean = false): string {
  return useCloudflare
    ? `https://cloudflare-ipfs.com/ipfs/${cid}`
    : `https://ipfs.io/ipfs/${cid}`;
}
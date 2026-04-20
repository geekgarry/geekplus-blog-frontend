import JSEncrypt from 'jsencrypt'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoR8mX0rGKLqzcWmOzbfj64K8ZIgOdH\n' +
  'nzkXSOVOZbFu/TJhZ7rFAN+eaGkl3C4buccQd/EjEsj9ir7ijT7h96MCAwEAAQ=='

const publicKeyS='MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJlTqi0x+GKDFDVEGZqVj5jfqbQOnu3d\n'+
  'u6ezJ/w87HOEhaKavinyJdzofgI6JwGovTmw/MfYubIPqh7JLrsFmZ8CAwEAAQ=='

const publicKeyL=`MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAtuZ/K43EkgQxXa0IWNUC
  8LvvetNQIBR51HWLg9EblAdzSL4Yu3obU5BT8KuvDq2ROyqQEtdjmUgfNyRy358h
  lfDReeHUGVcni8a+3UVdHaQCI1Oy3ZfKCgQntz4aTQOluhR4rwFVAWSPDDQyK5UW
  Fz5jkhHes4/mvogznd6TD98cAzTvo1IPguYeO4hmXHIifofouHBIDPt8lv3Hvy2J
  bqzpQ5gUZB8dDPQUPba5/nlOJRxDjhjcKRis7CD8DxVjiDoorTcnyeYmXELU2B3z
  grK5cNuzkwn8P9CMkJLbex1FxvAEL3ohQGSFomrQG93L7zA0RFZe/7rVgS37maKb
  DdPSip359Sfffzl1RwUkZEbnxP4TT0gPB9a0GMwKG89u4aQqafp/mp6TPBX4/AKT
  5qjyu2izePiV/UVmJG6ErnH8IlkN/k3GDMjSmY8sai5uwvzV6KWylTGQSCT8ottW
  9q551jUWyU3gX9L2gMiD9kC/6j8o5NAWbnCQS4fhdNxTnKBm0Q/BIwNUH70QOToO
  bP/u/B7+ZhhCfI0hLdCcgBIekt58lsQkx2nEbFReO1wk5bsdEQLIwz9UkW3DFXlI
  EFre2T4bx+SrdvYEMBCxb7jwoOY4TcFehY7wt6hKuP4EX5JILQOEUVwBCIOoHfAc
  RVATp4GyCcuK7lIjxnKzslMCAwEAAQ==`

const publicKeyLB="MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAtuZ/K43EkgQxXa0IWNUC\n" +
  "8LvvetNQIBR51HWLg9EblAdzSL4Yu3obU5BT8KuvDq2ROyqQEtdjmUgfNyRy358h\n" +
  "lfDReeHUGVcni8a+3UVdHaQCI1Oy3ZfKCgQntz4aTQOluhR4rwFVAWSPDDQyK5UW\n" +
  "Fz5jkhHes4/mvogznd6TD98cAzTvo1IPguYeO4hmXHIifofouHBIDPt8lv3Hvy2J\n" +
  "bqzpQ5gUZB8dDPQUPba5/nlOJRxDjhjcKRis7CD8DxVjiDoorTcnyeYmXELU2B3z\n" +
  "grK5cNuzkwn8P9CMkJLbex1FxvAEL3ohQGSFomrQG93L7zA0RFZe/7rVgS37maKb\n" +
  "DdPSip359Sfffzl1RwUkZEbnxP4TT0gPB9a0GMwKG89u4aQqafp/mp6TPBX4/AKT\n" +
  "5qjyu2izePiV/UVmJG6ErnH8IlkN/k3GDMjSmY8sai5uwvzV6KWylTGQSCT8ottW\n" +
  "9q551jUWyU3gX9L2gMiD9kC/6j8o5NAWbnCQS4fhdNxTnKBm0Q/BIwNUH70QOToO\n" +
  "bP/u/B7+ZhhCfI0hLdCcgBIekt58lsQkx2nEbFReO1wk5bsdEQLIwz9UkW3DFXlI\n" +
  "EFre2T4bx+SrdvYEMBCxb7jwoOY4TcFehY7wt6hKuP4EX5JILQOEUVwBCIOoHfAc\n" +
  "RVATp4GyCcuK7lIjxnKzslMCAwEAAQ=="

const privateKey = 'MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEAqhHyZfSsYourNxaY\n' +
  '7Nt+PrgrxkiA50efORdI5U5lsW79MmFnusUA355oaSXcLhu5xxB38SMSyP2KvuKN\n' +
  'PuH3owIDAQABAkAfoiLyL+Z4lf4Myxk6xUDgLaWGximj20CUf+5BKKnlrK+Ed8gA\n' +
  'kM0HqoTt2UZwA5E2MzS4EI2gjfQhz5X28uqxAiEA3wNFxfrCZlSZHb0gn2zDpWow\n' +
  'cSxQAgiCstxGUoOqlW8CIQDDOerGKH5OmCJ4Z21v+F25WaHYPxCFMvwxpcw99Ecv\n' +
  'DQIgIdhDTIqD2jfYjPTY8Jj3EDGPbH2HHuffvflECt3Ek60CIQCFRlCkHpi7hthh\n' +
  'YhovyloRYsM+IS9h/0BzlEAuO0ktMQIgSPT3aFAgJYwKpqRYKlLDVcflZFCKY7u3\n' +
  'UP8iWi1Qw0Y='

const privateKeyS = 'MIIBVQIBADANBgkqhkiG9w0BAQEFAASCAT8wggE7AgEAAkEAmVOqLTH4YoMUNUQZ\n'+
  'mpWPmN+ptA6e7d27p7Mn/Dzsc4SFopq+KfIl3Oh+AjonAai9ObD8x9i5sg+qHsku\n'+
  'uwWZnwIDAQABAkAvcZML7xVzrim3nb3qdnL7k+HYJFoLMnxZlPc/dr6Xs6Rif+HQ\n'+
  'aeKqu3jL+UIztbXueVCTsMCmaio/Evkyc3C5AiEAySVyV9grw2l3sz2D72+TNV8U\n'+
  'H0Xhd0rtVntuEd8hVPMCIQDDI9CsGcD+P01ZoJ6Ow6jEiOHuEfZli7H6cn+nzgkD\n'+
  'pQIhALn9lTAi47yKLjOfovpoCg9kvh94p1V+A91evlVqI9D/AiEAmST9emNH1AEI\n'+
  'CmQEq9QgGgW3Eeik7/KfPgcn6iDHcEUCIA+Rektqwz4qQo3cjrmPOVNkKVU1VOj2\n'+
  '3AZNVvsggR7W'

const privateKeyL=`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
  Bo+ehgkJO8Fri94meaWG7LjdUizvRw==`

const privateKeyLB="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\n" +
  "Bo+ehgkJO8Fri94meaWG7LjdUizvRw=="
// 加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}

// 解密
export function decrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey) // 设置私钥
  return encryptor.decrypt(txt) // 对数据进行解密
}

// 加密
export function encryptSt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKeyS) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}

// 解密
export function decryptSt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKeyS) // 设置私钥
  return encryptor.decrypt(txt) // 对数据进行解密
}

// 加密
export function encryptLg(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKeyLB) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}

// 解密
export function decryptLg(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKeyLB) // 设置私钥
  return encryptor.decrypt(txt) // 对数据进行解密
}

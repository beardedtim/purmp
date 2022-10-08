export class DomainItemNotFound extends Error {
  statusCode = 404;

  constructor(domain: string, key: string) {
    super();

    this.message = `Cannot find item ${domain}::${key}. Please change your query and try again.`;
  }
}

export class DuplicateDomainItemFound extends Error {
  stautsCode = 400;

  constructor(domain: string, key: string, value: string) {
    super();

    this.message = `Cannot create an item in the ${domain} with the key of "${key}" set to the value of "${value}" as there is already an item with that in the system. Please change the "${key}" value and try your request again.`;
  }
}

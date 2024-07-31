interface OrganizationMembership {
    role: string;
  }
  
  interface User {
    organizationMemberships: OrganizationMembership[];
  }
  
  interface Session {
    user: User;
  }
  
  function checkUserRole(session: Session | null | undefined): string | null {
    if (
      !session ||
      !session.user ||
      !session.user.organizationMemberships ||
      session.user.organizationMemberships.length === 0
    ) {
      return null; // Return null if the user is not a basic member
    }
  
    const organizationMemberships = session.user.organizationMemberships;
  
    // Loop through all organization memberships
    for (const membership of organizationMemberships) {
      if (membership.role) {
        return membership.role.toLowerCase(); // Return the role in lowercase if it exists
      }
    }
  
    return null; // Return null if no role is found in the memberships
  }
  
  export { checkUserRole };
  
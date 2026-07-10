import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Protects routes so only requests carrying a valid access-token JWT
 * in the Authorization header can proceed. Used on the Services module
 * (fully protected) and on the read/update endpoints of the Bookings
 * module — never on booking creation, which must stay public.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-access') {}

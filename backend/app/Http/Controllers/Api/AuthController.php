<?php

namespace App\Http\Controllers\Api;

use App\Data\TenantData;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class AuthController extends Controller
{
    /**
     * Inscription + création automatique d'un tenant personnel.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'workspace_name' => 'nullable|string|max:255',
            'subdomain' => 'required|string|max:100|unique:tenants,subdomain|alpha_dash',
            'type' => 'required|string|in:company,individual',
            'logo' => 'nullable|image|max:2048', // 2MB Max
        ]);

        $user = User::create([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Déterminer le nom de la marque par défaut
        $brandName = ($validated['type'] === 'company')
            ? ($validated['workspace_name'] ?? 'Ma Société')
            : $validated['full_name'];

        // Extraction de la charte graphique à partir du logo (Branding AI)
        $primaryColor = $validated['type'] === 'company' ? '#4B0082' : '#2563eb';
        $secondaryColor = '#FF8C00';
        $logoUrl = null;

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('public/logos');
            $logoUrl = str_replace('public/', 'storage/', $path);

            // Extraction intelligente et génération de palette (Branding AI v2)
            try {
                $manager = new ImageManager(Driver::class);
                $image = $manager->read($request->file('logo'));
                $image->resize(1, 1);
                $color = $image->pickColor(0, 0);

                $r = $color->red()->toInt();
                $g = $color->green()->toInt();
                $b = $color->blue()->toInt();

                $primaryColor = sprintf('#%02x%02x%02x', $r, $g, $b);

                // Calcul mathématique de la couleur secondaire (Harmonie pro)
                // On passe en HSL pour manipuler les teintes proprement
                $hsl = $this->rgbToHsl($r, $g, $b);

                // Secondaire : On décale la teinte de 30 degrés (analogue) pour un look pro
                $secondaryHsl = $hsl;
                $secondaryHsl['h'] = ($hsl['h'] + 30) % 360;
                $secondaryHsl['l'] = max(20, min(80, $hsl['l'] - 10)); // Un peu plus sombre
                $secondaryColor = $this->hslToHex($secondaryHsl['h'], $secondaryHsl['s'], $secondaryHsl['l']);

            } catch (\Exception $e) {
                // Fallback
            }
        }

        // Créer le tenant (workspace)
        $tenant = Tenant::create([
            'name' => $brandName,
            'brand_name' => $brandName,
            'subdomain' => strtolower($validated['subdomain']),
            'type' => $validated['type'],
            'logo_url' => $logoUrl,
            'primary_color' => $primaryColor,
            'secondary_color' => $secondaryColor ?? '#FF8C00',
        ]);

        // Attacher l'utilisateur comme owner
        $tenant->users()->attach($user->id, ['role' => 'owner']);
        $user->update(['current_tenant_id' => $tenant->id]);

        AuditLog::log('user_registered', [
            'email' => $user->email,
            'workspace' => $tenant->subdomain,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user->fresh(),
            'tenant' => TenantData::from($tenant),
            'token' => $token,
        ], 201);
    }

    /**
     * Connexion.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            AuditLog::log('login_failed', ['email' => $validated['email']], true);
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        AuditLog::log('login_success', ['email' => $user->email]);

        // Si l'utilisateur n'a pas de tenant courant, sélectionner le premier
        if (! $user->current_tenant_id) {
            $firstTenant = $user->tenants()->first();
            if ($firstTenant) {
                $user->update(['current_tenant_id' => $firstTenant->id]);
            }
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user->fresh()->load('currentTenant'),
            'token' => $token,
        ]);
    }

    /**
     * Déconnexion.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Profil de l'utilisateur + ses workspaces.
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('currentTenant', 'tenants'),
        ]);
    }

    /**
     * Switch de workspace (tenant).
     */
    public function switchTenant(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|uuid|exists:tenants,id',
        ]);

        $user = $request->user();

        // Vérifier que l'utilisateur a accès
        $isMember = $user->tenants()->where('tenant_id', $validated['tenant_id'])->exists();

        if (! $isMember) {
            return response()->json(['error' => 'Access denied.'], 403);
        }

        $user->update(['current_tenant_id' => $validated['tenant_id']]);

        return response()->json([
            'user' => $user->fresh()->load('currentTenant'),
            'message' => 'Workspace switched successfully.',
        ]);
    }

    private function rgbToHsl($r, $g, $b)
    {
        $r /= 255;
        $g /= 255;
        $b /= 255;
        $max = max($r, $g, $b);
        $min = min($r, $g, $b);
        $h = 0;
        $s = 0;
        $l = ($max + $min) / 2;
        if ($max != $min) {
            $d = $max - $min;
            $s = $l > 0.5 ? $d / (2 - $max - $min) : $d / ($max + $min);
            if ($max == $r) {
                $h = ($g - $b) / $d + ($g < $b ? 6 : 0);
            } elseif ($max == $g) {
                $h = ($b - $r) / $d + 2;
            } elseif ($max == $b) {
                $h = ($r - $g) / $d + 4;
            }
            $h /= 6;
        }

        return ['h' => $h * 360, 's' => $s * 100, 'l' => $l * 100];
    }

    private function hslToHex($h, $s, $l)
    {
        $h /= 360;
        $s /= 100;
        $l /= 100;
        $r = 0;
        $g = 0;
        $b = 0;
        if ($s == 0) {
            $r = $g = $b = $l;
        } else {
            $q = $l < 0.5 ? $l * (1 + $s) : $l + $s - $l * $s;
            $p = 2 * $l - $q;
            $r = $this->hueToRgb($p, $q, $h + 1 / 3);
            $g = $this->hueToRgb($p, $q, $h);
            $b = $this->hueToRgb($p, $q, $h - 1 / 3);
        }

        return sprintf('#%02x%02x%02x', round($r * 255), round($g * 255), round($b * 255));
    }

    private function hueToRgb($p, $q, $t)
    {
        if ($t < 0) {
            $t += 1;
        }
        if ($t > 1) {
            $t -= 1;
        }
        if ($t < 1 / 6) {
            return $p + ($q - $p) * 6 * $t;
        }
        if ($t < 1 / 2) {
            return $q;
        }
        if ($t < 2 / 3) {
            return $p + ($q - $p) * (2 / 3 - $t) * 6;
        }

        return $p;
    }
}

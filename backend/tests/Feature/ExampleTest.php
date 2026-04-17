<?php

it('has a healthy api status', function () {
    $response = $this->get('/api/health');
    
    $response->assertStatus(200)
             ->assertJson([
                 'status' => 'ok',
                 'service' => 'Desksuite API'
             ]);
});
